const state = {
  authMode: "login",
  profile: {
    name: "",
    bio: "",
    college: "",
    branch: "",
    year: "",
    skills: [],
    interests: [],
    files: [],
    private: false,
  },
  feedView: "followed",
  feed: {
    followed: ["Aarav shared a DSA roadmap.", "Mia posted internship tips."],
    clubs: ["AI Club scheduled a model-building workshop."],
    suggested: ["Follow DevOps Society.", "Join Product Circle."],
  },
  people: [
    { name: "Aarav", followed: false, connected: false, requested: false },
    { name: "Mia", followed: true, connected: true, requested: false },
    { name: "Rohan", followed: false, connected: false, requested: false },
  ],
  clubs: [
    { name: "AI Club", members: 24, posts: 12, joined: true },
    { name: "Robotics Hub", members: 17, posts: 8, joined: false },
  ],
  notifications: ["You have 1 new club invite."],
  lastPostTs: 0,
};

const q = (id) => document.getElementById(id);

function passionScore() {
  const score = Math.min(100, state.profile.skills.length * 8 + state.profile.interests.length * 7 + (state.profile.bio ? 15 : 0));
  q("passion-score").textContent = String(score);
}

function renderFeed() {
  const list = q("feed-list");
  list.innerHTML = "";
  state.feed[state.feedView].forEach((post) => {
    const li = document.createElement("li");
    li.textContent = post;
    list.appendChild(li);
  });
}

function clubScore(club) {
  return Math.round(club.members * 0.6 + club.posts * 1.4 + (club.joined ? 10 : 0));
}

function renderClubs() {
  const clubList = q("club-list");
  clubList.innerHTML = "";
  state.clubs.forEach((club, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${club.name}</strong> • Members: ${club.members} • Posts: ${club.posts} • 📊 Club Score: ${clubScore(club)}`;

    const joinBtn = document.createElement("button");
    joinBtn.textContent = club.joined ? "Leave" : "Join";
    joinBtn.onclick = () => {
      club.joined = !club.joined;
      state.notifications.unshift(`${club.joined ? "Joined" : "Left"} ${club.name}.`);
      renderClubs();
      renderNotifications();
    };

    const discussBtn = document.createElement("button");
    discussBtn.textContent = "Add Discussion";
    discussBtn.onclick = () => {
      state.clubs[index].posts += 1;
      state.notifications.unshift(`New discussion in ${club.name}.`);
      renderClubs();
      renderNotifications();
    };

    li.append(" ", joinBtn, " ", discussBtn);
    clubList.appendChild(li);
  });
}

function renderPeople() {
  const list = q("people-list");
  list.innerHTML = "";
  state.people.forEach((person) => {
    const li = document.createElement("li");
    li.textContent = `${person.name} ${person.connected ? "✅ Connected" : ""}`;

    const follow = document.createElement("button");
    follow.textContent = person.followed ? "Unfollow" : "Follow";
    follow.onclick = () => {
      person.followed = !person.followed;
      state.notifications.unshift(`${person.followed ? "Started" : "Stopped"} following ${person.name}.`);
      renderPeople();
      renderNotifications();
    };

    const connect = document.createElement("button");
    connect.textContent = person.connected ? "Connected" : person.requested ? "Requested" : "Connect";
    connect.disabled = person.connected || person.requested;
    connect.onclick = () => {
      person.requested = true;
      state.notifications.unshift(`Connection request sent to ${person.name}.`);
      renderPeople();
      renderNotifications();
    };

    li.append(" ", follow, " ", connect);
    list.appendChild(li);
  });

  const canChat = state.people.some((p) => p.connected);
  q("chat-status").textContent = canChat
    ? "💬 1:1 chat available with mutual connections."
    : "💬 1:1 chat unlocks after mutual connection.";
}

function renderNotifications() {
  const list = q("notifications");
  list.innerHTML = "";
  state.notifications.slice(0, 8).forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    list.appendChild(li);
  });
}

q("auth-toggle").onclick = () => {
  state.authMode = state.authMode === "login" ? "signup" : "login";
  q("auth-mode").textContent = `Mode: ${state.authMode[0].toUpperCase()}${state.authMode.slice(1)}`;
  q("auth-toggle").textContent = state.authMode === "login" ? "Switch to Signup" : "Switch to Login";
};

q("auth-form").onsubmit = (e) => {
  e.preventDefault();
  q("auth-status").textContent = `${state.authMode === "login" ? "Logged in" : "Account created"} (demo mode).`;
};

q("profile-form").onsubmit = (e) => {
  e.preventDefault();
  state.profile.name = q("name").value.trim();
  state.profile.bio = q("bio").value.trim();
  state.profile.college = q("college").value.trim();
  state.profile.branch = q("branch").value.trim();
  state.profile.year = q("year").value.trim();
  state.profile.skills = q("skills").value.split(",").map((s) => s.trim()).filter(Boolean);
  state.profile.interests = q("interests").value.split(",").map((s) => s.trim()).filter(Boolean);
  state.profile.files = Array.from(q("resume").files || []).map((f) => f.name);
  passionScore();
  state.notifications.unshift(`Profile updated for ${state.profile.name || "student"}.`);
  renderNotifications();
};

document.querySelectorAll(".feed-filter").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".feed-filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.feedView = btn.dataset.feed;
    renderFeed();
  };
});

q("post-btn").onclick = () => {
  const now = Date.now();
  if (now - state.lastPostTs < 7000) {
    q("post-status").textContent = "Anti-spam: please wait a few seconds before posting again.";
    return;
  }

  const text = q("new-post").value.trim();
  if (!text) {
    q("post-status").textContent = "Write something first.";
    return;
  }

  state.feed.followed.unshift(`${state.profile.name || "You"}: ${text}`);
  state.lastPostTs = now;
  q("new-post").value = "";
  q("post-status").textContent = "Post shared.";
  if (state.feedView === "followed") renderFeed();
};

q("search-btn").onclick = () => {
  const term = q("search-input").value.toLowerCase().trim();
  const results = [];

  state.people
    .filter((p) => p.name.toLowerCase().includes(term))
    .forEach((p) => results.push(`👤 ${p.name}`));

  state.clubs
    .filter((c) => c.name.toLowerCase().includes(term))
    .forEach((c) => results.push(`👥 ${c.name}`));

  const list = q("search-results");
  list.innerHTML = "";
  (results.length ? results : ["No matches found."]).forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    list.appendChild(li);
  });
};

q("club-form").onsubmit = (e) => {
  e.preventDefault();
  const name = q("club-name").value.trim();
  if (!name) return;

  state.clubs.unshift({ name, members: 1, posts: 0, joined: true });
  state.notifications.unshift(`Club created: ${name}.`);
  q("club-name").value = "";
  renderClubs();
  renderNotifications();
};

q("report-form").onsubmit = (e) => {
  e.preventDefault();
  const target = q("report-target").value.trim();
  const reason = q("report-reason").value.trim();
  q("moderation-status").textContent = `Report submitted for "${target}" with reason: "${reason}".`;
  q("report-target").value = "";
  q("report-reason").value = "";
};

q("private-profile").onchange = (e) => {
  state.profile.private = e.target.checked;
  q("moderation-status").textContent = `Privacy updated: profile is now ${state.profile.private ? "private" : "public"}.`;
};

renderFeed();
renderPeople();
renderClubs();
renderNotifications();
passionScore();
