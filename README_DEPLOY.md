# 🚀 Jutar POS - Production Deployment Guide

Follow these steps to deploy **Jutar POS** to Vercel and connect it to your Supabase project.

---

## 1. Prepare Your Repository
1.  **Initialize Git**: If you haven't already, run `git init` in your project root.
2.  **Commit Changes**: `git add .` followed by `git commit -m "Initial commit for Jutar POS"`.
3.  **Push to GitHub**: Create a new repository on GitHub and push your code there.

---

## 2. Deploy to Vercel
1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com) and sign in.
2.  **Import Project**: Click **"Add New"** -> **"Project"**.
3.  **Select Repository**: Connect your GitHub account and import the `jutar-pos` repository.
4.  **Configure Build**:
    - **Framework Preset**: Next.js (Automatic).
    - **Root Directory**: `./` (Automatic).
5.  **Environment Variables**:
    Under the **Environment Variables** section, add the following two keys from your **Supabase Dashboard -> Settings -> API**:
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
6.  **Deploy**: Click **"Deploy"**. Vercel will build and launch your application.

---

## 3. Database & Auth Setup (Supabase)
1.  **Database Migration**:
    - Go to **Supabase Dashboard -> SQL Editor**.
    - Copy the contents of `supabase/migrations/0001_initial_schema.sql` and run it. This sets up your tables, triggers, and mock data.
2.  **Authentication**:
    - Go to **Supabase Dashboard -> Authentication -> Users**.
    - Click **"Add User"** -> **"Create User"**.
    - Create an Admin Email and Password. You will use these to log into `/admin`.
3.  **URL Configuration**:
    - Go to **Supabase Dashboard -> Authentication -> URL Configuration**.
    - Set the **Site URL** to your Vercel deployment URL (e.g., `https://jutar-pos.vercel.app`).
    - Add `https://jutar-pos.vercel.app/**` to **Redirect URLs**.

---

## 🔧 Maintenance & Updates
- To update your site, simply `git push` to your GitHub main branch. Vercel will automatically redeploy the latest changes.
- To modify the menu, log into `/admin` to toggle items or update prices.
- To adjust inventory, use the **Backoffice** tools in the `/admin` dashboard.
