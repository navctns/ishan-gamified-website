document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const avatarDisplay = document.getElementById('avatar-display');
    const avatarImage = document.getElementById('avatar-image');
    const avatarInitials = document.getElementById('avatar-initials');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const randomAvatarBtn = document.getElementById('random-avatar-btn');
    const nameInput = document.getElementById('name-input');
    const ageInput = document.getElementById('age-input');
    const colorInput = document.getElementById('color-input');
    const aboutInput = document.getElementById('about-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const avatarPreview = document.getElementById('avatar-preview');
    const previewAvatar = document.getElementById('preview-avatar');
    const previewInitials = document.getElementById('preview-initials');
    const previewName = document.getElementById('preview-name');
    const previewDetails = document.getElementById('preview-details');
    const previewAbout = document.getElementById('preview-about');
    const gameDisplaySection = document.getElementById('game-display-section');
    const gameContainer = document.getElementById('game-container');
    const gameTitle = document.getElementById('game-title');
    const closeGameBtn = document.getElementById('close-game-btn');
    const pointsCounter = document.getElementById('points-counter');
    const levelCounter = document.getElementById('level-counter');
    const profileLevel = document.getElementById('profile-level');
    const xpBar = document.getElementById('xp-bar');
    const xpCount = document.getElementById('xp-count');
    const dailyRewardPopup = document.getElementById('daily-reward-popup');
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    const achievements = document.querySelectorAll('.achievement');

    // Game state
    let state = {
        points: 100,
        level: 1,
        xp: 30,
        gamesPlayed: [],
        lastRewardDate: null,
        achievements: {
            profileCreated: true,
            firstGamePlayed: false,
            gameMaster: false,
            customAvatar: false
        }
    };

    // Initialize
    init();

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Avatar upload
    changeAvatarBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    avatarImage.src = event.target.result;
                    avatarImage.classList.remove('hidden');
                    avatarInitials.classList.add('hidden');
                    updatePreview();
                    
                    // Award achievement for custom avatar
                    if (!state.achievements.customAvatar) {
                        state.achievements.customAvatar = true;
                        awardAchievement('Custom Avatar', 20);
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    });

    // Random avatar
    randomAvatarBtn.addEventListener('click', function() {
        const randomColors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'];
        const randomTextColors = ['text-red-700', 'text-blue-700', 'text-green-700', 'text-yellow-700', 'text-purple-700'];
        
        // Remove all color classes
        avatarDisplay.classList.remove('bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200');
        avatarInitials.classList.remove('text-red-700', 'text-blue-700', 'text-green-700', 'text-yellow-700', 'text-purple-700');
        
        // Add random classes
        const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
        const randomTextColor = randomTextColors[Math.floor(Math.random() * randomTextColors.length)];
        
        avatarDisplay.classList.add(randomColor);
        avatarInitials.classList.add(randomTextColor);
        
        updatePreview();
        addPoints(5);
        showFeedback('+5 points for random avatar!');
    });

    // Save profile
    saveProfileBtn.addEventListener('click', function() {
        addXp(5);
        showFeedback('+5 XP for saving profile!');
        avatarDisplay.classList.add('animate-pulse');
        setTimeout(() => avatarDisplay.classList.remove('animate-pulse'), 1000);
    });

    // Input changes
    [nameInput, ageInput, colorInput, aboutInput].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Close game button
    closeGameBtn.addEventListener('click', function() {
        gameDisplaySection.classList.add('hidden');
        gameContainer.innerHTML = '<p class="text-gray-500">Select a game to play from above!</p>';
    });

    // Claim daily reward
    claimRewardBtn.addEventListener('click', function() {
        dailyRewardPopup.classList.add('hidden');
        addXp(25);
        addPoints(25);
        state.lastRewardDate = new Date().toDateString();
        localStorage.setItem('gameState', JSON.stringify(state));
        showFeedback('+25 XP and +25 points!');
        createConfetti();
    });

    // Initialize preview
    updatePreview();

    // Functions
    function init() {
        // Load saved state
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
        
        // Update UI from state
        pointsCounter.textContent = state.points;
        levelCounter.textContent = state.level;
        profileLevel.textContent = state.level;
        xpCount.textContent = state.xp;
        xpBar.style.width = `${state.xp}%`;
        
        // Check for daily reward
        checkDailyReward();
        
        // Update achievements
        updateAchievements();
    }

    function toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle('dark');
        
        if (html.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    function updatePreview() {
        // Get initials from name
        const name = nameInput.value.trim();
        let initials = 'ME';
        if (name) {
            const nameParts = name.split(' ');
            initials = nameParts.map(part => part[0]).join('').toUpperCase();
            if (initials.length > 2) initials = initials.substring(0, 2);
        }
        
        // Update avatar preview
        previewInitials.textContent = initials;
        previewName.textContent = name || 'Your Name';
        previewDetails.textContent = `${ageInput.value || '0'} years old • Favorite color: ${colorInput.value}`;
        previewAbout.textContent = aboutInput.value || 'Tell us something about yourself!';
        
        // Copy avatar style to preview
        previewAvatar.className = 'w-16 h-16 rounded-full flex items-center justify-center border-2 border-yellow-400';
        Array.from(avatarDisplay.classList).forEach(cls => {
            if (cls.startsWith('bg-')) {
                previewAvatar.classList.add(cls);
            }
        });
        
        Array.from(avatarInitials.classList).forEach(cls => {
            if (cls.startsWith('text-')) {
                previewInitials.classList.add(cls);
            }
        });
    }

    function loadGame(gameType) {
        gameDisplaySection.classList.remove('hidden');
        
        // Clear previous game
        gameContainer.innerHTML = '';
        
        // Set game title
        let title = '';
        let gameHTML = '';
        let xpReward = 0;
        
        switch(gameType) {
            case 'memory':
                title = 'Memory Match Game';
                xpReward = 10;
                gameHTML = `
                    <div class="text-center p-4">
                        <h3 class="text-xl font-bold mb-4">Memory Match</h3>
                        <p class="mb-6">Match the pairs to win!</p>
                        <div class="grid grid-cols-4 gap-4 max-w-md mx-auto">
                            ${Array(8).fill().map((_, i) => `
                                <div onclick="gameCardClicked(this)" class="game-card bg-blue-500 h-16 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-600 transition">
                                    ?
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="completeGame('memory', ${xpReward})" class="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            I Won! Give me ${xpReward} XP
                        </button>
                    </div>
                `;
                break;
                
            case 'puzzle':
                title = 'Puzzle Adventure';
                xpReward = 15;
                gameHTML = `
                    <div class="text-center p-4">
                        <h3 class="text-xl font-bold mb-4">Puzzle Adventure</h3>
                        <p class="mb-6">Solve the puzzle!</p>
                        <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                            ${Array(8).fill().map((_, i) => `
                                <div class="bg-green-500 h-16 rounded-lg flex items-center justify-center text-white font-bold">
                                    ${i+1}
                                </div>
                            `).join('')}
                            <div class="bg-gray-300 h-16 rounded-lg"></div>
                        </div>
                        <button onclick="completeGame('puzzle', ${xpReward})" class="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                            I Solved It! Give me ${xpReward} XP
                        </button>
                    </div>
                `;
                break;
                
            case 'runner':
                title = 'Running Race';
                xpReward = 20;
                gameHTML = `
                    <div class="text-center p-4">
                        <h3 class="text-xl font-bold mb-4">Running Race</h3>
                        <p class="mb-6">Click Run to start racing!</p>
                        <div class="relative h-32 bg-gray-200 rounded-lg overflow-hidden max-w-md mx-auto">
                            <div id="runner" class="absolute bottom-0 left-4 w-12 h-12 bg-red-500 rounded-full"></div>
                            <button id="run-btn" class="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition">
                                Run!
                            </button>
                        </div>
                        <button onclick="completeGame('runner', ${xpReward})" class="mt-6 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition">
                            I Finished! Give me ${xpReward} XP
                        </button>
                    </div>
                `;
                break;
        }
        
        gameTitle.textContent = title;
        gameContainer.innerHTML = gameHTML;
        
        // Track game played
        if (!state.gamesPlayed.includes(gameType)) {
            state.gamesPlayed.push(gameType);
            
            // Award achievement for first game played
            if (!state.achievements.firstGamePlayed) {
                state.achievements.firstGamePlayed = true;
                awardAchievement('First Game Played', 15);
            }
            
            // Check for game master achievement
            if (state.gamesPlayed.length >= 3 && !state.achievements.gameMaster) {
                state.achievements.gameMaster = true;
                awardAchievement('Game Master', 30);
            }
        }
    }

    function completeGame(gameType, xp) {
        addXp(xp);
        addPoints(xp);
        showFeedback(`+${xp} XP and +${xp} points for playing!`);
        gameDisplaySection.classList.add('hidden');
    }

    function addXp(amount) {
        state.xp += amount;
        
        // Check for level up
        if (state.xp >= 100) {
            state.level += 1;
            state.xp = state.xp - 100;
            levelUp();
        }
        
        // Update UI
        xpCount.textContent = state.xp;
        xpBar.style.width = `${state.xp}%`;
        profileLevel.textContent = state.level;
        levelCounter.textContent = state.level;
        
        // Save state
        localStorage.setItem('gameState', JSON.stringify(state));
    }

    function addPoints(amount) {
        state.points += amount;
        pointsCounter.textContent = state.points;
        
        // Animate points counter
        pointsCounter.classList.add('scale-150', 'text-yellow-400');
        setTimeout(() => {
            pointsCounter.classList.remove('scale-150', 'text-yellow-400');
        }, 500);
        
        // Save state
        localStorage.setItem('gameState', JSON.stringify(state));
    }

    function levelUp() {
        showFeedback(`Level Up! Now you're level ${state.level}`, true);
        createConfetti();
        addPoints(50); // Bonus points for leveling up
    }

    function showFeedback(message, isLevelUp = false) {
        const feedback = document.createElement('div');
        feedback.className = `fixed bottom-4 right-4 bg-${isLevelUp ? 'purple' : 'green'}-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.remove('animate-bounce');
            feedback.classList.add('fade-out');
            setTimeout(() => feedback.remove(), 500);
        }, 2000);
    }

    function checkDailyReward() {
        const today = new Date().toDateString();
        if (state.lastRewardDate !== today) {
            setTimeout(() => {
                dailyRewardPopup.classList.remove('hidden');
            }, 2000);
        }
    }

    function awardAchievement(title, xp) {
        addXp(xp);
        addPoints(xp);
        showFeedback(`Achievement Unlocked: ${title}! +${xp} XP`, true);
        updateAchievements();
    }

    function updateAchievements() {
        achievements.forEach(achievement => {
            const title = achievement.querySelector('h3').textContent;
            if (
                (title === 'Profile Created' && state.achievements.profileCreated) ||
                (title === 'First Game Played' && state.achievements.firstGamePlayed) ||
                (title === 'Game Master' && state.achievements.gameMaster) ||
                (title === 'Custom Avatar' && state.achievements.customAvatar)
            ) {
                achievement.setAttribute('data-achieved', 'true');
            }
        });
    }

    function createConfetti() {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    // Make functions available globally
    window.gameCardClicked = function(card) {
        card.textContent = '🐶';
        card.classList.remove('bg-blue-500');
        card.classList.add('bg-blue-400');
    };

    window.completeGame = completeGame;
    window.loadGame = loadGame;
});