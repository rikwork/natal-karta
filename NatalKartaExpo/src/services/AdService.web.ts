class AdService {
    async initialize() {
        console.log('Web Mock: AdService initialized');
    }

    async loadAd() {
        console.log('Web Mock: Ad loaded');
    }

    showRewardedAd(onRewarded: () => void, onFailedOrDismissed: () => void) {
        console.log('Web Mock: Showing rewarded ad...');
        // Simulate ad watch time (3 seconds) then reward
        setTimeout(() => {
            console.log('Web Mock: Ad finished. Rewarding user.');
            onRewarded();
        }, 1500);
    }
}

export default new AdService();
