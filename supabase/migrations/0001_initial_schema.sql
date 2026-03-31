-- 1. MASTER DATA
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, 
  category TEXT NOT NULL, 
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT, 
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, 
  unit TEXT NOT NULL, 
  current_stock DECIMAL(10,2) DEFAULT 0, 
  low_stock_threshold DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10,2) NOT NULL
);

-- 2. TRANSACTIONS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL, 
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, 
  status TEXT DEFAULT 'pending', 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL, 
  price_at_time DECIMAL(10,2) NOT NULL
);

CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_material_id UUID REFERENCES raw_materials(id),
  log_type TEXT NOT NULL, 
  quantity_change DECIMAL(10,2) NOT NULL,
  notes TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. THE "HANDS-OFF" INVENTORY TRIGGER
CREATE OR REPLACE FUNCTION deduct_inventory_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe_item RECORD;
    total_deduction DECIMAL(10,2);
BEGIN
    IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
        FOR item IN SELECT product_id, quantity FROM order_items WHERE order_id = NEW.id LOOP
            FOR recipe_item IN SELECT raw_material_id, quantity_required FROM recipes WHERE product_id = item.product_id LOOP
                total_deduction := item.quantity * recipe_item.quantity_required;
                
                UPDATE raw_materials 
                SET current_stock = current_stock - total_deduction 
                WHERE id = recipe_item.raw_material_id;

                INSERT INTO inventory_logs (raw_material_id, log_type, quantity_change, notes)
                VALUES (recipe_item.raw_material_id, 'sale_deduct', -total_deduction, 'Auto-deducted from Order ' || NEW.receipt_number);
            END LOOP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_inventory
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_payment();

-- 4. ROBUST SEED DATA (MOCK DATA)
-- RAW MATERIALS
INSERT INTO raw_materials (id, name, unit, current_stock, low_stock_threshold) VALUES
('10000000-0000-0000-0000-000000000001', 'Beef Patty (150g)', 'piece', 500, 50),
('10000000-0000-0000-0000-000000000002', 'Chicken Breast (150g)', 'piece', 400, 40),
('10000000-0000-0000-0000-000000000003', 'Burger Bun', 'piece', 1000, 100),
('10000000-0000-0000-0000-000000000004', 'Cheddar Cheese', 'slice', 2000, 200),
('10000000-0000-0000-0000-000000000005', 'Frozen Potato Fries', 'kg', 100, 10),
('10000000-0000-0000-0000-000000000006', 'Cola Concentrate', 'L', 50, 5),
('10000000-0000-0000-0000-000000000007', 'Orange Juice Syrup', 'L', 30, 3),
('10000000-0000-0000-0000-000000000008', 'Vanilla Ice Cream Base', 'L', 40, 4),
('10000000-0000-0000-0000-000000000009', 'Bacon Strips', 'piece', 800, 80),
('10000000-0000-0000-0000-000000000010', 'Lettuce', 'kg', 20, 2);

-- PRODUCTS
INSERT INTO products (id, name, category, price) VALUES
('20000000-0000-0000-0000-000000000001', 'Classic Cheeseburger', 'burgers', 5.99),
('20000000-0000-0000-0000-000000000002', 'Spicy Chicken Burger', 'burgers', 6.99),
('20000000-0000-0000-0000-000000000003', 'Bacon Deluxe', 'burgers', 7.99),
('20000000-0000-0000-0000-000000000004', 'French Fries (L)', 'sides', 3.99),
('20000000-0000-0000-0000-000000000005', 'Cola (M)', 'drinks', 1.99),
('20000000-0000-0000-0000-000000000006', 'Soft Serve Cone', 'desserts', 1.49);

-- RECIPES
INSERT INTO recipes (product_id, raw_material_id, quantity_required) VALUES
-- Classic Cheeseburger: 1 Bun, 1 Beef, 1 Cheese, 0.01kg Lettuce
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1), 
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1), 
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 1), 
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 0.01),
-- Spicy Chicken Burger: 1 Bun, 1 Chicken, 1 Cheese, 0.01kg Lettuce
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1), 
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 1), 
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 1), 
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 0.01),
-- Bacon Deluxe: 1 Bun, 1 Beef, 3 Bacon, 1 Cheese
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 1), 
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 1), 
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', 3), 
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 1),
-- French Fries: 0.3kg Potato
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 0.3),
-- Cola: 0.1L Concentrate
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', 0.1),
-- Soft Serve: 0.1L Ice Cream Base
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', 0.1);
