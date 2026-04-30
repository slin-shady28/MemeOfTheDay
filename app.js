const storageKey = "meme-of-the-day-posts"
const cycleKey = "meme-of-the-day-cycle-start"
const dayMs = 24 * 60 * 60 * 1000

const tabs = document.querySelectorAll(".tab")
const pages = document.querySelectorAll(".page")
const jumpButtons = document.querySelectorAll("[data-jump]")
const form = document.querySelector("#memeForm")
const clearFormButton = document.querySelector("#clearForm")
const resetButton = document.querySelector("#resetNow")
const searchInput = document.querySelector("#searchInput")
const typeFilter = document.querySelector("#typeFilter")
const grid = document.querySelector("#memeGrid")
const emptyState = document.querySelector("#emptyState")
const template = document.querySelector("#memeCardTemplate")
const memeCount = document.querySelector("#memeCount")
const photoCount = document.querySelector("#photoCount")
const timeLeftSmall = document.querySelector("#timeLeftSmall")
const timeLeftBig = document.querySelector("#timeLeftBig")
const spotlight = document.querySelector("#spotlight")

const getCycleStart = () => {
  const saved = Number(localStorage.getItem(cycleKey))
  if (Number.isFinite(saved) && saved > 0) return saved
  const now = Date.now()
  localStorage.setItem(cycleKey, String(now))
  return now
}

const saveCycleStart = (time) => {
  localStorage.setItem(cycleKey, String(time))
}

const loadMemes = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? []
  } catch {
    return []
  }
}

const saveMemes = (memes) => {
  localStorage.setItem(storageKey, JSON.stringify(memes))
}

let cycleStart = getCycleStart()
let memes = loadMemes()

const resetBoard = () => {
  memes = []
  cycleStart = Date.now()
  saveCycleStart(cycleStart)
  saveMemes(memes)
  render()
}

const checkReset = () => {
  if (Date.now() - cycleStart >= dayMs) {
    resetBoard()
  }
}

const formatTime = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const seconds = String(totalSeconds % 60).padStart(2, "0")
  return `${hours}:${minutes}:${seconds}`
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const setActiveTab = (tabName) => {
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabName))
  pages.forEach((page) => page.classList.toggle("is-active", page.id === tabName))
  window.scrollTo({ top: 0, behavior: "smooth" })
}

const getFilteredMemes = () => {
  const query = searchInput.value.trim().toLowerCase()
  const type = typeFilter.value

  return memes
    .filter((meme) => {
      if (type === "photo" && !meme.image) return false
      if (type === "text" && meme.image) return false
      if (!query) return true
      return [meme.title, meme.text, meme.author].some((value) =>
        value.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => b.votes - a.votes || b.createdAt - a.createdAt)
}

const renderMemeCard = (meme) => {
  const card = template.content.firstElementChild.cloneNode(true)
  const media = card.querySelector(".meme-media")
  const meta = card.querySelector(".meme-meta")
  const title = card.querySelector("h3")
  const text = card.querySelector("p")
  const voteButton = card.querySelector(".vote-button")
  const voteCount = card.querySelector(".vote-count")

  if (meme.image) {
    const img = document.createElement("img")
    img.src = meme.image
    img.alt = meme.title
    media.replaceChildren(img)
  } else {
    media.textContent = meme.text || meme.title
  }

  meta.textContent = `${meme.author || "Anonymous"} - ${new Date(meme.createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`
  title.textContent = meme.title
  text.textContent = meme.text
  voteCount.textContent = `${meme.votes} ${meme.votes === 1 ? "vote" : "votes"}`
  voteButton.addEventListener("click", () => {
    meme.votes += 1
    saveMemes(memes)
    render()
  })

  return card
}

const renderSpotlight = () => {
  const top = [...memes].sort((a, b) => b.votes - a.votes || b.createdAt - a.createdAt)[0]

  if (!top) {
    spotlight.className = "spotlight-empty"
    spotlight.textContent = "No memes yet. Post the first one."
    return
  }

  spotlight.className = "spotlight-filled"
  spotlight.replaceChildren(renderMemeCard(top))
}

const render = () => {
  checkReset()
  const filtered = getFilteredMemes()

  grid.replaceChildren(...filtered.map(renderMemeCard))
  emptyState.classList.toggle("is-visible", filtered.length === 0)
  memeCount.textContent = String(memes.length)
  photoCount.textContent = String(memes.filter((meme) => meme.image).length)
  renderSpotlight()
}

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  checkReset()

  const file = document.querySelector("#fileInput").files[0]
  const imageUrl = document.querySelector("#urlInput").value.trim()
  const text = document.querySelector("#textInput").value.trim()
  const title = document.querySelector("#titleInput").value.trim()
  const author = document.querySelector("#authorInput").value.trim()

  if (!file && !imageUrl && !text) {
    alert("Add a photo, image URL, or text meme first.")
    return
  }

  const image = file ? await readFileAsDataUrl(file) : imageUrl

  memes.push({
    id: crypto.randomUUID(),
    author,
    title,
    text,
    image,
    votes: 0,
    createdAt: Date.now(),
  })

  saveMemes(memes)
  form.reset()
  render()
  setActiveTab("gallery")
})

clearFormButton.addEventListener("click", () => form.reset())
resetButton.addEventListener("click", resetBoard)
searchInput.addEventListener("input", render)
typeFilter.addEventListener("change", render)

tabs.forEach((tab) => tab.addEventListener("click", () => setActiveTab(tab.dataset.tab)))
jumpButtons.forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.jump)))

setInterval(() => {
  checkReset()
  const remaining = dayMs - (Date.now() - cycleStart)
  const formatted = formatTime(remaining)
  timeLeftSmall.textContent = formatted
  timeLeftBig.textContent = formatted
}, 1000)

render()
