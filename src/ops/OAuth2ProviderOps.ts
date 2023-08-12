import {
  OAuth2ProviderSkeleton,
  getOAuth2Provider as _getOAuth2Provider,
  createOAuth2Provider as _createOAuth2Provider,
  putOAuth2Provider as _putOAuth2Provider,
  deleteOAuth2Provider as _deleteOAuth2Provider,
} from '../api/OAuth2ProviderApi';
import { State } from '../shared/State';

export type OAuth2Provider = {
  /**
   * Read oauth2 provider
   * @returns {Promise<OAuth2ProviderSkeleton>} a promise resolving to an oauth2 provider object
   */
  readOAuth2Provider(): Promise<OAuth2ProviderSkeleton>;
  /**
   * Create oauth2 provider
   * @param {OAuth2ProviderSkeleton} providerData oauth2 provider data
   * @returns {Promise<OAuth2ProviderSkeleton>} a promise resolving to an oauth2 provider object
   */
  createOAuth2Provider(
    providerData?: OAuth2ProviderSkeleton
  ): Promise<OAuth2ProviderSkeleton>;
  /**
   * Update or create oauth2 provider
   * @param {OAuth2ProviderSkeleton} providerData oauth2 provider data
   * @returns {Promise<OAuth2ProviderSkeleton>} a promise resolving to an oauth2 provider object
   */
  updateOAuth2Provider(
    providerData: OAuth2ProviderSkeleton
  ): Promise<OAuth2ProviderSkeleton>;
  /**
   * Delete oauth2 provider
   * @returns {Promise<OAuth2ProviderSkeleton>} a promise resolving to an oauth2 provider object
   */
  deleteOAuth2Provider(): Promise<OAuth2ProviderSkeleton>;

  // Deprecated

  /**
   * Get oauth2 provider
   * @returns {Promise<OAuth2ProviderSkeleton>} a promise resolving to an oauth2 provider object
   * @deprecated since v2.0.0 use {@link OAuth2Provider.readOAuth2Provider | readOAuth2Provider} instead
   * ```javascript
   * importFirstSocialIdentityProvider(importData: SocialProviderExportInterface): Promise<SocialIdpSkeleton>
   * ```
   * @group Deprecated
   */
  getOAuth2Provider(): Promise<OAuth2ProviderSkeleton>;
};

export default (state: State): OAuth2Provider => {
  return {
    async readOAuth2Provider(): Promise<OAuth2ProviderSkeleton> {
      return readOAuth2Provider({ state });
    },
    async createOAuth2Provider(
      providerData?: OAuth2ProviderSkeleton
    ): Promise<OAuth2ProviderSkeleton> {
      return createOAuth2Provider({ providerData, state });
    },
    async updateOAuth2Provider(
      providerData: OAuth2ProviderSkeleton
    ): Promise<OAuth2ProviderSkeleton> {
      return updateOAuth2Provider({ providerData, state });
    },
    async deleteOAuth2Provider(): Promise<OAuth2ProviderSkeleton> {
      return deleteOAuth2Provider({ state });
    },

    // Deprecated

    async getOAuth2Provider(): Promise<OAuth2ProviderSkeleton> {
      return readOAuth2Provider({ state });
    },
  };
};

export async function readOAuth2Provider({
  state,
}: {
  state: State;
}): Promise<OAuth2ProviderSkeleton> {
  return _getOAuth2Provider({ state });
}

/**
 * Create OAuth2 provider
 * @param {OAuth2ProviderSkeleton} providerData oauth2 provider object
 * @returns {Promise<OAuth2ProviderSkeleton>} a promise that resolves to an oauth2 provider object
 */
export async function createOAuth2Provider({
  providerData: providerData,
  state,
}: {
  providerData: OAuth2ProviderSkeleton;
  state: State;
}): Promise<OAuth2ProviderSkeleton> {
  return _createOAuth2Provider({ providerData, state });
}

/**
 * Update or create OAuth2 provider
 * @param {OAuth2ProviderSkeleton} providerData oauth2 provider object
 * @returns {Promise<OAuth2ProviderSkeleton>} a promise that resolves to an oauth2 provider object
 */
export async function updateOAuth2Provider({
  providerData: providerData,
  state,
}: {
  providerData: OAuth2ProviderSkeleton;
  state: State;
}): Promise<OAuth2ProviderSkeleton> {
  return _putOAuth2Provider({ providerData, state });
}

/**
 * Delete OAuth2 Provider
 * @returns {Promise<OAuth2ProviderSkeleton>} a promise that resolves to an oauth2 provider object
 */
export async function deleteOAuth2Provider({
  state,
}: {
  state: State;
}): Promise<OAuth2ProviderSkeleton> {
  return _deleteOAuth2Provider({ state });
}
