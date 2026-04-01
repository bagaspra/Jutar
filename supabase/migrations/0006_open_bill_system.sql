-- Update the inventory deduction function to support the 'open' bill status.
-- Inventory should ONLY be deducted when an order moves to 'paid' status.

CREATE OR REPLACE FUNCTION deduct_inventory_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe_item RECORD;
    total_deduction DECIMAL(10,2);
BEGIN
    -- Condition: Trigger when status is updated TO 'paid' FROM anything ELSE (pending, open, etc.)
    -- This prevents double deduction if someone updates other fields in a 'paid' order.
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
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

-- No changes needed to the trigger itself as it already watches AFTER UPDATE OF status.
-- However, we'll recreate it just to be sure it's fresh.
DROP TRIGGER IF EXISTS trigger_deduct_inventory ON orders;
CREATE TRIGGER trigger_deduct_inventory
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_payment();

-- Also ensure initial INSERTs with status='paid' trigger it.
-- Previous trigger was ONLY on UPDATE. Let's make it more robust.
DROP TRIGGER IF EXISTS trigger_deduct_inventory_insert ON orders;
CREATE TRIGGER trigger_deduct_inventory_insert
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_payment();
