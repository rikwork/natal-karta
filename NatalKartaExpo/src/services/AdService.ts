import { AdRequestConfiguration, RewardedAdLoader, RewardedAd, MobileAds } from 'yandex-mobile-ads';

class AdService {
  private loader: RewardedAdLoader | null = null;
  private currentAd: RewardedAd | null = null;

  // Use the production Yandex Ad Unit ID.
  private readonly adUnitId = 'R-M-19500558-1';

  async initialize() {
    try {
      await MobileAds.initialize();
      console.log('MobileAds core initialized successfully');
      this.loader = await RewardedAdLoader.create();
      console.log('AdService loader initialized successfully');
      // Preload the first ad
      this.loadAd();
    } catch (error) {
      console.error('Failed to initialize AdService', error);
    }
  }

  async loadAd() {
    if (!this.loader) return;

    try {
      const adRequestConfiguration = new AdRequestConfiguration({
        adUnitId: this.adUnitId,
      });

      this.currentAd = await this.loader.loadAd(adRequestConfiguration);
      console.log('Ad loaded successfully');
    } catch (error) {
      console.error('Failed to load ad', error);
    }
  }

  showRewardedAd(onRewarded: () => void, onFailedOrDismissed: () => void) {
    if (!this.currentAd) {
      console.warn('Ad not ready to be shown. Loading new ad and using fallback.');
      // If ad fails to show or load because of network/emulator, fallback to unlocking anyway for UX
      this.loadAd();
      onFailedOrDismissed();
      return;
    }

    let hasBeenRewarded = false;

    this.currentAd.onAdFailedToShow = (error) => {
      console.warn('Ad failed to show', error);
      onFailedOrDismissed();
      this.loadAd(); // preload next
    };

    this.currentAd.onAdDismissed = () => {
      console.log('Ad dismissed');
      if (!hasBeenRewarded) {
        onFailedOrDismissed();
      }
      this.currentAd = null;
      this.loadAd(); // preload next
    };

    this.currentAd.onRewarded = (reward) => {
      console.log('Ad rewarded completely', reward);
      hasBeenRewarded = true;
      onRewarded();
    };

    this.currentAd.show();
  }
}

export default new AdService();
