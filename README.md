# Nano Banana - AI Image Generation

AI-powered image generation and editing using Google's Gemini 2.5 Flash Image.

## Features

- 🎨 AI-powered image variations
- 🖼️ Multi-image blending with character consistency
- 🚀 Fast generation (10-30 seconds)
- 📱 Responsive design
- ⚡ Built with Next.js 15 and React 19

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI API Key (Gemini)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nanoimageportrait.git
cd nanoimageportrait
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Google AI API key to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/theramjad/nanoimageportrait)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your `GEMINI_API_KEY` environment variable in Vercel project settings
4. Deploy!

### Environment Variables

Make sure to set the following environment variables in your Vercel project:

- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY` - Your Google AI API key

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **AI:** Google Gemini 2.5 Flash Image
- **State Management:** TanStack Query
- **Forms:** React Hook Form + Zod

## License

MIT

## Credits

Powered by Google DeepMind's Gemini 2.5 Flash Image
