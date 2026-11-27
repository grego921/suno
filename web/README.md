# 🎵 Suno Web — ACE-Step 1.5 Music Studio

A futuristic, dark-themed, open-source AI music generation studio inspired by Suno, powered by **ACE-Step 1.5** running in Google Colab with Cloudflare Tunnel.

---

## 🚀 Features

- **Futuristic Cyberpunk UI**: Neon cyan & violet accents, glassmorphic panels, animated sound waves, 100% mobile-first responsive.
- **Style & Tags Input**: Prompt editor with quick genre/instrument tags (Cyberpunk, Synthwave, Pop, Lo-Fi, EDM, Orchestral, Rock, etc.).
- **Inspire Me / Random Sample**: One-click AI sample generation fetching curated captions and lyrics via `/create_random_sample`.
- **AI Prompt Enhancement**: Optimize and structure your prompt & lyrics with 5Hz LM reasoning via `/format_input`.
- **Lyrics Editor**: Structure helpers for `[Verse]`, `[Chorus]`, `[Bridge]`, `[Outro]`, `[Intro]`, and an **Instrumental Mode** toggle.
- **Complete Advanced Controls**:
  - Model selection (`acestep-v15-turbo`, `acestep-v15-base`).
  - Duration (15s to 240s).
  - Batch size (1 to 4 variations).
  - Inference steps & Guidance scale.
  - Seed controller with random toggle.
  - BPM tempo, Key & Scale, Time signature.
  - Vocal language (en, pt, es, ja, zh, fr, ko, de).
  - Audio formats (MP3, WAV, FLAC, OPUS, AAC).
  - **Thinking Mode** (5Hz LM semantic code planning).
- **Generation Queue with Live Status**: Live elapsed timer, queue position indicator, animated progress, and instant error handling.
- **Audio Player with Waveform Visualizer**:
  - Real-time animated canvas waveform.
  - Seek bar, time display, loop toggle, and volume control.
- **One-Click Download**: Download any generated variation directly.
- **Browser Persistence**: Generation history and active tasks saved locally in `localStorage`.
- **Seamless Zero-Config Connection**:
  - Auto-reads `?api=<tunnel_url>&token=<token>` from URL query parameters.
  - Stores credentials securely in `localStorage` and cleans the URL without reloading.

---

## 🛠️ Deploying to Vercel

1. Push your repository to GitHub (`github.com/<your-username>/suno`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Build & Development Settings**:
   - Set **Root Directory** to `web`.
4. Deploy! No environment variables or server secrets required (everything runs securely client-side in the browser).

---

## 🎧 How to Connect to Google Colab

1. Open `ACE-Step-Colab.ipynb` in Google Colab.
2. Select runtime: **Runtime → Change runtime type → GPU (T4 or A100)**.
3. In Cell 3, set `SITE_URL` to your Vercel deployment URL (e.g. `https://suno-web.vercel.app`).
4. Run the notebook.
5. Once the model finishes loading, Colab will print a pre-connected link:
   ```
   🚀 OPEN DIRECTLY:
   https://suno-web.vercel.app/?api=https://xxxx.trycloudflare.com&token=secret123
   ```
6. Click the link and start generating music!
