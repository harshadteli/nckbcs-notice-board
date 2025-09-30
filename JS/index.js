const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySlg852_P770a_mBtiS610WtIbtcFe8f3uLk2hYoXb30FqW6E700My6vae977zGgLurw/exec';
document.addEventListener('DOMContentLoaded', () => {
    const noticeBoard = document.getElementById('notice-board');
    const subscribeModal = document.getElementById('subscribe-modal');
    const subscribeForm = document.getElementById('subscribe-form');
    const subscribeMessage = document.getElementById('subscribe-message');
    const closeBtn = document.getElementById('close-modal-btn');
    const welcomeBanner = document.getElementById('welcome-banner');
    const notificationToast = document.getElementById('notification-toast');
    const noticeLoader = document.getElementById('notice-loader'); 
    let subscriberName = localStorage.getItem('subscriberName');
    function showToast(message) {
        notificationToast.textContent = message;
        notificationToast.classList.add('show');
        notificationToast.style.display = 'block';
        setTimeout(() => {
            notificationToast.classList.remove('show');
            setTimeout(() => { notificationToast.style.display = 'none'; }, 500);
        }, 3000);
    }
    function showWelcomeMessage(name) {
        welcomeBanner.textContent = `Welcome, ${name} | Thank you for subscribing!`;
    }
    function createNoticeCard(notice) {
        const card = document.createElement('div');
        card.classList.add('notice-card');
        card.innerHTML = `
            <div class="card-header">
                <h2>${notice.title}</h2>
                <span class="date">${notice.date}</span>
            </div>
            <p class="content"><b>${notice.content}</b> <br></p>
            <div class="card-footer">
                <span class="tag subject">Subject: ${notice.subject} <br></span>
                <span class="tag target">Class: ${notice.bcsYear} <br> Division - ${notice.division}</span>
                <span class="author"><br>Faculty Name: <b><i>${notice.teacher}</i></b></span>
            </div>
        `;
        return card;
    }
    async function fetchAndDisplayNotices() {
        if (noticeLoader) {
        noticeLoader.style.display = 'flex'; 
        }
        const existingCards = noticeBoard.querySelectorAll('.notice-card');
        existingCards.forEach(card => card.remove());
        try {
            const response = await fetch(`${SCRIPT_URL}?action=getNotices`);
            const notices = await response.json();
            if (!notices || notices.error || notices.length === 0) {
                const emptyMsg = document.createElement('h3');
                emptyMsg.className = 'empty-message';
                emptyMsg.textContent = 'No official notices are currently available.';
                noticeBoard.appendChild(emptyMsg);
            } 
            else {
                notices.forEach(notice => {
                    const noticeCard = createNoticeCard(notice);
                    noticeBoard.appendChild(noticeCard);
                });
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
            const errorMsg = document.createElement('h3');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Error connecting to the notice server. Please refresh.';
            noticeBoard.appendChild(errorMsg);
        } 
        finally {
            if (noticeLoader) {
                noticeLoader.style.display = 'none';
            }
        }
    }
    function checkSubscriptionStatus() {
        if (subscriberName) {
            showWelcomeMessage(subscriberName);
        } 
        else {
            if (subscribeModal) {
                subscribeModal.style.display = 'flex';
            }
        }
        fetchAndDisplayNotices();
    }
    subscribeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('subscriber-name').value;
        const email = document.getElementById('subscriber-email').value;
        subscribeMessage.textContent = 'Subscribing...';
        const params = new URLSearchParams({ 
            action: 'subscribe', 
            name: name, 
            email: email 
        });
        try {
            const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                subscribeMessage.textContent = 'Subscription successful! Please check your email.';
                subscribeMessage.className = 'message success';
                localStorage.setItem('isSubscribed', 'true');
                localStorage.setItem('subscriberName', name);
                subscriberName = name; 
                showToast('Check your email! Subscription confirmed.');
                showWelcomeMessage(name);
                setTimeout(() => {
                    subscribeModal.style.display = 'none';
                }, 2000);
            } 
            else {
                subscribeMessage.textContent = 'Subscription failed: ' + (result.error || 'Server error.');
                subscribeMessage.className = 'message error';
            }
        } catch (error) {
            console.error('Subscription error:', error);
            subscribeMessage.textContent = 'An error occurred. Please try again.';
            subscribeMessage.className = 'message error';
        }
    });
    closeBtn.addEventListener('click', () => {
        subscribeModal.style.display = 'none';
    });
    subscribeModal.addEventListener('click', (e) => {
        if (e.target.id === 'subscribe-modal') {
            subscribeModal.style.display = 'none';
        }
    });
    checkSubscriptionStatus();

});

