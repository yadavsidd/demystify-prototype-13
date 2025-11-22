
# Demystify - AI Legal Document Analysis

Demystify is an AI-powered suite of tools designed to simplify the complexities of legal and official documents. It allows users to analyze, translate, draft, compare, and get guidance on documents with confidence and clarity.

![Demystify App Screenshot](https://i.imgur.com/example.png) <!-- It's good practice to add a screenshot of your app here -->

## ✨ Features

-   **📄 Document Demystifier**: Upload a document (TXT, PDF, JPG) to get a simple summary, an acceptance score, and a list of red flags with suggested rewrites.
-   **🌐 Document Translator**: Instantly translate documents into over 20 languages.
-   **✍️ Contract Drafter**: Generate professional legal documents (Leases, NDAs, etc.) by filling out a simple form.
-   **⚖️ Document Comparison**: Upload two documents to get an AI-powered analysis of their differences, missing clauses, and relative risks.
-   **🧭 Document Guide**: A conversational interface for step-by-step guidance on official procedures.
-   **🔐 Full User Authentication**: Secure user registration and login powered by **Supabase**.
-   **🗂️ Analysis History**: Automatically saves your analysis results, drafts, and conversations to your account for future reference.
-   **🌗 Light/Dark Mode**: A sleek, modern UI with support for both light and dark themes.

---

## 🚀 Local Development Setup

This project uses **Supabase** for authentication/database and **Google Gemini** for its AI capabilities. Follow these steps to get it running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
-   npm (comes with Node.js)
-   A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
-   A **Supabase** account and a new project. You can create one for free at [supabase.com](https://supabase.com/).

### Step 1: Clone the Repository

First, clone the project repository to your local machine using Git.

```bash
git clone <your-repository-url>
cd <repository-folder-name>
```

### Step 2: Install Dependencies

Run this command from the project's root directory to install all required dependencies listed in `package.json`.

```bash
npm install
```

### Step 3: Configure Environment Variables

The application requires API keys to function.

1.  **Create your `.env` file:** In the root of the project, create a new file named `.env`. You can do this by copying the `.env.example` file.

2.  **Add your Google Gemini API key:** Open the `.env` file and add your key.
    ```env
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

3.  **Set up your Supabase project:**
    -   Go to your Supabase project dashboard.
    -   Navigate to **Project Settings > API**.
    -   Find your **Project URL** and the **`anon` (public) API Key**.

4.  **Add your Supabase keys to the `.env` file:**
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL_HERE
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
    ```

5.  **Configure Supabase Authentication:**
    -   In your Supabase dashboard, go to **Authentication > Providers**.
    -   Ensure the **Email** provider is enabled.
    -   (Optional but recommended for development) Go to **Authentication > Settings** and turn **off** the "Confirm email" toggle. This allows you to sign up without needing to verify your email, which is faster for local testing. Remember to turn it back on for production.

6.  **Set up Supabase Database Table:**
    - Go to the **SQL Editor** in your Supabase dashboard.
    - Run the following SQL script to create the `history` table. This is required for the History feature to work.

    ```sql
    CREATE TABLE public.history (
        id bigint NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        user_id uuid DEFAULT auth.uid() NOT NULL,
        type text NOT NULL,
        title text,
        data jsonb
    );

    ALTER TABLE public.history OWNER TO postgres;
    CREATE SEQUENCE public.history_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    ALTER TABLE public.history_id_seq OWNER TO postgres;
    ALTER SEQUENCE public.history_id_seq OWNED BY public.history.id;
    ALTER TABLE ONLY public.history ALTER COLUMN id SET DEFAULT nextval('public.history_id_seq'::regclass);
    ALTER TABLE ONLY public.history
        ADD CONSTRAINT history_pkey PRIMARY KEY (id);
    ALTER TABLE ONLY public.history
        ADD CONSTRAINT history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- Enable Row Level Security
    ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

    -- Create RLS Policies
    CREATE POLICY "Enable insert for authenticated users only" ON public.history FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Enable read access for own records" ON public.history FOR SELECT TO authenticated USING ((auth.uid() = user_id));
    CREATE POLICY "Enable update for own records" ON public.history FOR UPDATE TO authenticated USING ((auth.uid() = user_id));
    CREATE POLICY "Enable delete for own records" ON public.history FOR DELETE TO authenticated USING ((auth.uid() = user_id));
    ```

### Step 4: Run the Development Server

Now you're ready to start the app.

```bash
npm run dev
```

### Step 5: Open the Application

Once the server is running, Vite will display a local URL in your terminal. You can access the application in your web browser at:

[http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment

This project is configured for easy deployment to platforms like Vercel.

### Deploying to Vercel

1.  Push your project to a Git provider (GitHub, GitLab, etc.).
2.  Log in to your Vercel dashboard and import the Git repository.
3.  Vercel will auto-detect your project as a **Vite** application. The default build settings are correct.
4.  Go to your project's **Settings > Environment Variables** tab.
5.  Add the same three variables from your `.env` file:
    -   `API_KEY`
    -   `VITE_SUPABASE_URL`
    -   `VITE_SUPABASE_ANON_KEY`
6.  Trigger a new deployment. Vercel will build and deploy your application.
