# Meme of the Day

A simple classroom website for posting a daily meme without login or signup.

## What It Does

- Lets classmates and teachers post a meme for the day
- Supports photo uploads, image links, and text-only memes
- Uses a black and red design
- Includes tabs for Home, Post, Memes, Timer, and Rules
- Lets users search and filter the meme board
- Includes voting on memes
- Resets the board after 24 hours

## How To Run

Open `index.html` in a browser, or run a local server:

```powershell
python -m http.server 5180
```

Then open:

```text
http://127.0.0.1:5180/
```

## Files

- `index.html` - page layout and tabs
- `styles.css` - black/red design and responsive layout
- `app.js` - posting, voting, search, filtering, timer, and reset logic

## Important Note

Right now, memes are saved in the browser with `localStorage`. That means posts only stay on the same device/browser.

For the whole class to see the same memes from different devices, the project needs a backend or database later.

## Project Status

Current version: working front-end prototype.
