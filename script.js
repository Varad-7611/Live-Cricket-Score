// ===== DOM Elements =====
const navBtns = document.querySelectorAll(".nav-btn")
const categoryBtns = document.querySelectorAll(".category-btn")
const sections = document.querySelectorAll(".section")
const liveMatchesContainer = document.getElementById("live-matches")
const recentMatchesContainer = document.getElementById("recent-matches")
const upcomingMatchesContainer = document.getElementById("upcoming-matches")
const tickerContent = document.getElementById("ticker-content")

// ===== API Base URL =====
const API_BASE = ""

// ===== State =====
let currentCategory = "all"
let allLiveMatches = []
let allRecentMatches = []
let allUpcomingMatches = []

// ===== Tab Navigation =====
navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab

    navBtns.forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")

    sections.forEach((s) => s.classList.remove("active"))
    document.getElementById(`${tab}-section`).classList.add("active")

    if (tab === "live") {
      fetchLiveMatches()
    } else if (tab === "recent") {
      fetchRecentMatches()
    } else if (tab === "upcoming") {
      fetchUpcomingMatches()
    }
  })
})

// ===== Category filter functionality =====
categoryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryBtns.forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")
    currentCategory = btn.dataset.category

    // Re-render current active section with filter
    const activeSection = document.querySelector(".section.active")
    if (activeSection.id === "live-section") {
      displayMatchesByCategory(allLiveMatches, liveMatchesContainer, "live")
    } else if (activeSection.id === "recent-section") {
      displayMatchesByCategory(allRecentMatches, recentMatchesContainer, "recent")
    } else if (activeSection.id === "upcoming-section") {
      displayMatchesByCategory(allUpcomingMatches, upcomingMatchesContainer, "upcoming")
    }
  })
})

// ===== Mouse tracking for card glow effect =====
document.addEventListener("mousemove", (e) => {
  const cards = document.querySelectorAll(".match-card")
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty("--mouse-x", `${x}%`)
    card.style.setProperty("--mouse-y", `${y}%`)
  })
})

// ===== Fetch Live Matches =====
async function fetchLiveMatches() {
  liveMatchesContainer.innerHTML = getLoadingHTML("Loading live matches...")

  try {
    const response = await fetch(`${API_BASE}/api/live`)
    const data = await response.json()
    allLiveMatches = parseMatchesWithType(data)
    displayMatchesByCategory(allLiveMatches, liveMatchesContainer, "live")
  } catch (error) {
    liveMatchesContainer.innerHTML = getErrorHTML("Failed to load live matches")
    console.error("Error fetching live matches:", error)
  }
}

// ===== Fetch Recent Matches =====
async function fetchRecentMatches() {
  recentMatchesContainer.innerHTML = getLoadingHTML("Loading recent matches...")

  try {
    const response = await fetch(`${API_BASE}/api/matches`)
    const data = await response.json()
    allRecentMatches = parseMatchesWithType(data)
    displayMatchesByCategory(allRecentMatches, recentMatchesContainer, "recent")
  } catch (error) {
    recentMatchesContainer.innerHTML = getErrorHTML("Failed to load recent matches")
    console.error("Error fetching recent matches:", error)
  }
}

// ===== Fetch Upcoming Matches =====
async function fetchUpcomingMatches() {
  upcomingMatchesContainer.innerHTML = getLoadingHTML("Loading upcoming matches...")

  try {
    const response = await fetch(`${API_BASE}/api/upcoming`)
    const data = await response.json()
    allUpcomingMatches = parseMatchesWithType(data)
    displayMatchesByCategory(allUpcomingMatches, upcomingMatchesContainer, "upcoming")
    updateTicker()
  } catch (error) {
    upcomingMatchesContainer.innerHTML = getErrorHTML("Failed to load upcoming matches")
    console.error("Error fetching upcoming matches:", error)
  }
}

// ===== Parse matches with category type (International, Domestic, Women) =====
function parseMatchesWithType(data) {
  const matches = []
  if (data.typeMatches) {
    data.typeMatches.forEach((type) => {
      const matchType = type.matchType || "" // International, Domestic, League, Women
      if (type.seriesMatches) {
        type.seriesMatches.forEach((series) => {
          if (series.seriesAdWrapper && series.seriesAdWrapper.matches) {
            const seriesName = series.seriesAdWrapper.seriesName || ""
            series.seriesAdWrapper.matches.forEach((match) => {
              matches.push({
                ...match,
                categoryType: matchType,
                seriesName: seriesName,
              })
            })
          }
        })
      }
    })
  }
  return matches
}

// ===== Filter and display matches by category =====
function displayMatchesByCategory(matches, container, type) {
  let filteredMatches = matches

  if (currentCategory !== "all") {
    filteredMatches = matches.filter((match) => {
      const catType = (match.categoryType || "").toLowerCase()
      if (currentCategory === "international") {
        return catType.includes("international")
      } else if (currentCategory === "domestic") {
        return catType.includes("domestic") || catType.includes("league")
      } else if (currentCategory === "women") {
        return catType.includes("women") || (match.seriesName || "").toLowerCase().includes("women")
      }
      return true
    })
  }

  if (filteredMatches.length === 0) {
    container.innerHTML = getEmptyHTML(type, currentCategory)
    return
  }

  // Group matches by series
  const groupedMatches = {}
  filteredMatches.forEach((match) => {
    const seriesName = match.seriesName || "Other Matches"
    if (!groupedMatches[seriesName]) {
      groupedMatches[seriesName] = []
    }
    groupedMatches[seriesName].push(match)
  })

  let html = ""
  Object.keys(groupedMatches).forEach((seriesName) => {
    const seriesMatches = groupedMatches[seriesName].slice(0, 10)
    const categoryType = seriesMatches[0]?.categoryType || ""

    html += `
      <div class="series-group">
        <div class="series-header">
          <span class="series-badge">${getCategoryLabel(categoryType)}</span>
          <span class="series-name">${seriesName}</span>
        </div>
        ${seriesMatches.map((match) => createMatchCard(match, type)).join("")}
      </div>
    `
  })

  container.innerHTML = html
}

// ===== Get category label =====
function getCategoryLabel(categoryType) {
  const cat = (categoryType || "").toLowerCase()
  if (cat.includes("international")) return "INT"
  if (cat.includes("women")) return "WOM"
  if (cat.includes("domestic")) return "DOM"
  if (cat.includes("league")) return "T20"
  return "ALL"
}

// ===== Create horizontal match card =====
function createMatchCard(match, type) {
  const matchInfo = match.matchInfo || match
  const matchId = matchInfo.matchId
  const team1 = matchInfo.team1 || {}
  const team2 = matchInfo.team2 || {}
  const venue = matchInfo.venueInfo?.ground || matchInfo.venue || "TBD"
  const matchFormat = matchInfo.matchFormat || "N/A"
  const status = matchInfo.status || ""
  const team1Score = match.matchScore?.team1Score?.inngs1 || {}
  const team2Score = match.matchScore?.team2Score?.inngs1 || {}
  const startDate = matchInfo.startDate
    ? new Date(Number.parseInt(matchInfo.startDate)).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""
  const categoryType = match.categoryType || ""

  const isLive = type === "live"
  const isUpcoming = type === "upcoming"

  return `
    <div class="match-card ${isUpcoming ? "upcoming" : ""}" data-match-id="${matchId}">
      <div class="match-meta">
        <span class="match-type">${matchFormat}</span>
        <span class="match-category">${getCategoryLabel(categoryType)}</span>
      </div>
      
      <div class="teams-horizontal">
        <div class="team-block">
          <div class="team-flag">${(team1.teamSName || "T1").substring(0, 3)}</div>
          <div class="team-details">
            <span class="team-name">${team1.teamName || "Team 1"}</span>
            <span class="team-score">${isUpcoming ? "—" : formatScore(team1Score)}</span>
          </div>
        </div>
        
        <span class="vs-badge">VS</span>
        
        <div class="team-block">
          <div class="team-flag">${(team2.teamSName || "T2").substring(0, 3)}</div>
          <div class="team-details">
            <span class="team-name">${team2.teamName || "Team 2"}</span>
            <span class="team-score">${isUpcoming ? "—" : formatScore(team2Score)}</span>
          </div>
        </div>
      </div>
      
      <div class="match-info-section">
        ${
          isUpcoming
            ? `
          <span class="match-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            ${startDate}
          </span>
        `
            : `
          <span class="match-status ${isLive ? "live" : ""}">${status}</span>
        `
        }
        <span class="match-venue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${venue}
        </span>
      </div>
    </div>
  `
}

// ===== Format Score =====
function formatScore(innings) {
  if (!innings || innings.runs === undefined) return "—"
  const overs = innings.overs ? ` (${innings.overs})` : ""
  return `${innings.runs}/${innings.wickets || 0}${overs}`
}

// ===== Update Footer Ticker =====
function updateTicker() {
  if (allUpcomingMatches.length === 0) {
    tickerContent.innerHTML = "<span>No upcoming matches scheduled</span>"
    return
  }

  const tickerItems = allUpcomingMatches.slice(0, 15).map((match) => {
    const info = match.matchInfo || match
    const team1 = info.team1?.teamSName || "T1"
    const team2 = info.team2?.teamSName || "T2"
    const format = info.matchFormat || ""
    const venue = info.venueInfo?.ground || ""
    return `${team1} vs ${team2} (${format}) - ${venue}`
  })

  tickerContent.innerHTML = `<span>${tickerItems.join("  •  ")}  •  ${tickerItems.join("  •  ")}</span>`
}

// ===== Helper Functions =====
function getLoadingHTML(message) {
  return `
    <div class="loading-container">
      <div class="loader-advanced">
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
      </div>
      <p>${message}</p>
    </div>
  `
}

function getErrorHTML(message) {
  return `
    <div class="error-message">
      <p>Something went wrong: ${message}</p>
      <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">Please try again later</p>
    </div>
  `
}

function getEmptyHTML(type, category) {
  const categoryName = category === "all" ? "" : ` ${category}`
  const messages = {
    live: `No${categoryName} live matches at the moment`,
    recent: `No${categoryName} recent matches found`,
    upcoming: `No${categoryName} upcoming matches scheduled`,
  }
  return `
    <div class="no-matches">
      <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🏏</div>
      <p>${messages[type] || "No matches found"}</p>
    </div>
  `
}

// ===== Initial Load =====
document.addEventListener("DOMContentLoaded", () => {
  fetchLiveMatches()
  fetchUpcomingMatches()
})
