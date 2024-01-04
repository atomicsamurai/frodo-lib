/**
 * To record and update snapshots, you must perform 3 steps in order:
 * 
 * *** Note: By default, the tests record against https://openam-frodo-dev.forgeblocks.com/am
 * *** There are other host profiles defined in 'src/utils/TestConfig.ts' and you can use any one of
 * *** those by setting `FRODO_TEST_HOST=frodo-dev` env var on the command line for the tests
 * 
 * 1. Record API responses
 *
 *    This step breaks down into 5 phases:
 *
 *    Phase 1: Record Group 1 of non-destructive tests
 *    Phase 2: Record Group 2 of non-destructive tests - Import all
 *    Phase 3: Record Group 1 of DESTRUCTIVE tests - Deletes by entity id
 *    Phase 4: Record Group 2 of DESTRUCTIVE tests - Delete all
 *
 *    Because destructive tests interfere with the recording of non-destructive
 *    tests and also interfere among themselves, they have to be run in groups
 *    of non-interfering tests.
 *
 *    To record API responses, you must call the test:record script and
 *    override all the connection state variables required to connect to the
 *    env to record from and also indicate the phase:
 *
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=1 npm run test:record Saml2Ops
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=2 npm run test:record Saml2Ops
 *
 *    THESE TESTS ARE DESTRUCTIVE!!! DO NOT RUN AGAINST AN ENV WITH ACTIVE CONFIGURATION!!!
 *
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=3 npm run test:record Saml2Ops
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=4 npm run test:record Saml2Ops
 *
 *    The above command assumes that you have a connection profile for
 *    'frodo-dev' on your development machine.
 *
 * 2. Update snapshots
 *
 *    After recording API responses, you must manually update/create snapshots
 *    by running:
 *
 *        FRODO_DEBUG=1 npm run test:update Saml2Ops
 *
 * 3. Test your changes
 *
 *    If 1 and 2 didn't produce any errors, you are ready to run the tests in
 *    replay mode and make sure they all succeed as well:
 *
 *        npm run test:only Saml2Ops
 *
 * Note: FRODO_DEBUG=1 is optional and enables debug logging for some output
 * in case things don't function as expected
 */
import { state } from '../index';
import * as Saml2Ops from './Saml2Ops';
import Constants from '../shared/Constants';
import { Saml2ProiderLocation } from '../api/Saml2Api';
import {
  getSaml2ProviderImportData,
  getSaml2ProvidersImportData,
} from '../test/mocks/ForgeRockApiMockEngine';
import { encodeBase64Url } from '../utils/Base64Utils';
import { autoSetupPolly, filterRecording } from '../utils/AutoSetupPolly';
import { connection as c } from '../utils/TestConfig';
const ctx = autoSetupPolly();

const testHost = process.env.FRODO_TEST_HOST?process.env.FRODO_TEST_HOST:'frodo-dev';
process.env.FRODO_HOST = 
  c[`${testHost}`].host + 
  c[`${testHost}`].context;

state.setDeploymentType(Constants.CLOUD_DEPLOYMENT_TYPE_KEY);

async function stageProvider(provider: { entityId: string }, create = true) {
  // delete if exists, then create
  try {
    await Saml2Ops.readSaml2Provider({ entityId: provider.entityId, state });
    await Saml2Ops.deleteSaml2Provider({ entityId: provider.entityId, state });
  } catch (error) {
    if (error.isAxiosError) {
      console.log(
        `Error deleting provider '${provider.entityId}': ${error.message}`
      );
      console.dir(error.response?.data);
    }
  } finally {
    if (create) {
      try {
        await Saml2Ops.importSaml2Provider({
          entityId: provider.entityId,
          importData: getSaml2ProviderImportData(provider.entityId),
          options: {
            deps: true
          },
          state,
        });
      } catch (error) {
        console.log(
          `Error importing provider '${provider.entityId}': ${error.message}`
        );
        console.dir(error.response?.data);
      }
    }
  }
}

describe('Saml2Ops', () => {
  type SamlProvider = {
    entityId: string;
    location: Saml2ProiderLocation;
    entityId64: string;
  };
  const provider1: SamlProvider = {
    entityId: 'iSPAzure',
    location: 'hosted',
    entityId64: encodeBase64Url('iSPAzure'),
  };
  const provider2: SamlProvider = {
    entityId: 'urn:federation:MicrosoftOnline',
    location: 'remote',
    entityId64: encodeBase64Url('urn:federation:MicrosoftOnline'),
  };
  const provider3: SamlProvider = {
    entityId: 'https://idc.scheuber.io/am/saml2/IDPFedlet',
    location: 'hosted',
    entityId64: encodeBase64Url('https://idc.scheuber.io/am/saml2/IDPFedlet'),
  };
  const provider4: SamlProvider = {
    entityId: 'https://sts.windows.net/711ffa9c-5972-4713-ace3-688c9732614a/',
    location: 'remote',
    entityId64: encodeBase64Url(
      'https://sts.windows.net/711ffa9c-5972-4713-ace3-688c9732614a/'
    ),
  };
  const provider5: SamlProvider = {
    entityId: 'https://idc.scheuber.io/am/saml2/IDPAzure',
    location: 'hosted',
    entityId64: encodeBase64Url('https://idc.scheuber.io/am/saml2/IDPAzure'),
  };
  const provider6: SamlProvider = {
    entityId: 'https://idc.scheuber.io/am/saml2/IDPBroadcom',
    location: 'hosted',
    entityId64: encodeBase64Url('https://idc.scheuber.io/am/saml2/IDPBroadcom'),
  };
  const provider7: SamlProvider = {
    entityId: 'idp',
    location: 'remote',
    entityId64: encodeBase64Url('idp'),
  };
  const provider8: SamlProvider = {
    entityId: 'SPAzure',
    location: 'hosted',
    entityId64: encodeBase64Url('SPAzure'),
  };
  const provider9: SamlProvider = {
    entityId: 'volkerDevSP',
    location: 'hosted',
    entityId64: encodeBase64Url('volkerDevSP'),
  };
  const provider10: SamlProvider = {
    entityId: 'https://saml.mytestrun.com/sp',
    location: 'remote',
    entityId64: encodeBase64Url('https://saml.mytestrun.com/sp'),
  };
  // in recording mode, setup test data before recording
  beforeAll(async () => {
    if (
      process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '1'
    ) {
      await stageProvider(provider1);
      await stageProvider(provider2);
      await stageProvider(provider3);
      await stageProvider(provider4);
      await stageProvider(provider5, false);
      await stageProvider(provider6, false);
      await stageProvider(provider7, false);
    } else if (
      process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '2'
    ) {
      await stageProvider(provider1, false);
      await stageProvider(provider2, false);
      await stageProvider(provider3, false);
      await stageProvider(provider4, false);
      await stageProvider(provider5, false);
      await stageProvider(provider6, false);
      await stageProvider(provider7, false);
      await stageProvider(provider8, false);
      await stageProvider(provider9, false);
      await stageProvider(provider10, false);
    } else if (
      process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '5'
    ) {
      await stageProvider(provider1, false);
      await stageProvider(provider2, false);
      await stageProvider(provider7, false);
      await stageProvider(provider8, false);
      await stageProvider(provider9, false);
    }
    // Pahses 3 + 4
    else if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageProvider(provider1);
      await stageProvider(provider2);
      await stageProvider(provider3);
      await stageProvider(provider4);
      await stageProvider(provider5);
      await stageProvider(provider6);
      await stageProvider(provider7);
    }
  });
  // in recording mode, remove test data after recording
  afterAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageProvider(provider1, false);
      await stageProvider(provider2, false);
      await stageProvider(provider3, false);
      await stageProvider(provider4, false);
      await stageProvider(provider5, false);
      await stageProvider(provider6, false);
      await stageProvider(provider7, false);
      await stageProvider(provider8, false);
      await stageProvider(provider9, false);
      await stageProvider(provider10, false);
    }
  });
  beforeEach(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      ctx.polly.server.any().on('beforePersist', (_req, recording) => {
        // console.debug('filtering...');
        filterRecording(recording);
      });
    }
  });

  // Phase 1
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '1')
  ) {
    describe('createSaml2ExportTemplate()', () => {
      test('0: Method is implemented', () => {
        expect(Saml2Ops.createSaml2ExportTemplate).toBeDefined();
      });

      test('1: Create saml2 export template', () => {
        const response = Saml2Ops.createSaml2ExportTemplate({ state });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });
    });

    describe('readSaml2ProviderStubs()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.readSaml2ProviderStubs).toBeDefined();
      });

      test('1: Read saml2 provider stubs', async () => {
        const response = await Saml2Ops.readSaml2ProviderStubs({ state });
        expect(response).toMatchSnapshot();
      });
    });

    describe('getSaml2ProviderMetadataUrl()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.getSaml2ProviderMetadataUrl).toBeDefined();
      });

      test(`1: Get metadata url for hosted provider '${provider3.entityId}'`, async () => {
        const response = Saml2Ops.getSaml2ProviderMetadataUrl({
          entityId: provider3.entityId,
          state,
        });
        expect(response).toMatch(
          new RegExp(
            `^${state.getHost()}`
          )
        );
        const url = new URL(response);
        expect(url.pathname).toMatch('/am/saml2/jsp/exportmetadata.jsp');
        const searchParams = new URLSearchParams(url.search);
        expect(searchParams.get('entityid')).toMatch(provider3.entityId);
      });

      test(`2: Get metadata url for remote provider '${provider4.entityId}'`, async () => {
        const response = Saml2Ops.getSaml2ProviderMetadataUrl({
          entityId: provider4.entityId,
          state,
        });
        expect(response).toMatch(
          new RegExp(
            `^${state.getHost()}`
          )
        );
        const url = new URL(response);
        expect(url.pathname).toMatch('/am/saml2/jsp/exportmetadata.jsp');
        const searchParams = new URLSearchParams(url.search);
        expect(searchParams.get('entityid')).toMatch(provider4.entityId);
      });
    });

    describe('getSaml2ProviderMetadata()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.getSaml2ProviderMetadata).toBeDefined();
      });

      test(`1: Get metadata for hosted provider '${provider1.entityId}'`, async () => {
        const response = await Saml2Ops.getSaml2ProviderMetadata({
          entityId: provider1.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test(`2: Get metadata for remote provider '${provider4.entityId}'`, async () => {
        const response = await Saml2Ops.getSaml2ProviderMetadata({
          entityId: provider4.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('readSaml2ProviderStub()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.readSaml2ProviderStub).toBeDefined();
      });

      test(`1: Read stub of hosted provider '${provider1.entityId}'`, async () => {
        const response = await Saml2Ops.readSaml2ProviderStub({
          entityId: provider1.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test(`2: Read stub of remote provider '${provider4.entityId}'`, async () => {
        const response = await Saml2Ops.readSaml2ProviderStub({
          entityId: provider4.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('getSaml2Provider()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.readSaml2Provider).toBeDefined();
      });

      test(`1: Read hosted provider '${provider1.entityId}'`, async () => {
        const response = await Saml2Ops.readSaml2Provider({
          entityId: provider1.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test(`2: Read remote provider '${provider4.entityId}'`, async () => {
        const response = await Saml2Ops.readSaml2Provider({
          entityId: provider4.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('exportSaml2Provider()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.exportSaml2Provider).toBeDefined();
      });

      test(`1: Export hosted SP w/o dependencies '${provider1.entityId}'`, async () => {
        const response = await Saml2Ops.exportSaml2Provider({
          entityId: provider1.entityId,
          options: { deps: false },
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test(`2: Export hosted SP w/ dependencies '${provider1.entityId}'`, async () => {
        const response = await Saml2Ops.exportSaml2Provider({
          entityId: provider1.entityId,
          options: { deps: true },
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test(`3: Export hosted IdP w/o dependencies '${provider3.entityId}'`, async () => {
        const response = await Saml2Ops.exportSaml2Provider({
          entityId: provider3.entityId,
          options: { deps: false },
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test(`4: Export hosted IdP w/ dependencies '${provider3.entityId}'`, async () => {
        const response = await Saml2Ops.exportSaml2Provider({
          entityId: provider3.entityId,
          options: { deps: true },
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test(`5: Export remote IdP '${provider4.entityId}'`, async () => {
        const response = await Saml2Ops.exportSaml2Provider({
          entityId: provider4.entityId,
          options: { deps: false },
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test(`6: Export remote SP '${provider2.entityId}'`, async () => {
        const response = await Saml2Ops.exportSaml2Provider({
          entityId: provider4.entityId,
          options: { deps: false },
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

    });

    describe('exportSaml2Providers()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.exportSaml2Providers).toBeDefined();
      });

      test('1: Export saml2 entity providers w/o dependencies', async () => {
        const response = await Saml2Ops.exportSaml2Providers({ options: { deps: false },state });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test('1: Export saml2 entity providers w/ dependencies', async () => {
        const response = await Saml2Ops.exportSaml2Providers({ options: { deps: true },state });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });
    });

    describe('importSaml2Provider()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.importSaml2Provider).toBeDefined();
      });

      test(`1: Import hosted provider '${provider5.entityId}'`, async () => {
        expect.assertions(2);
        const response = await Saml2Ops.importSaml2Provider({
          entityId: provider5.entityId,
          importData: getSaml2ProviderImportData(provider5.entityId),
          options: {
            deps: true
          },
          state,
        });
        expect(response).toBeTruthy();
        expect(response).toMatchSnapshot();
      });

      test(`2: Import hosted provider w/ dependencies '${provider6.entityId}'`, async () => {
        expect.assertions(2);

        let handleDependencyFlag = false;
        console.debug(`sandlog: before handler`);
        ctx.polly.server.host(c[`${testHost}`].host, () => {
          ctx.polly.server.put('/am/json/*/scripts/:id').once('request', req => {
            console.debug('sandlog: inside handler');
            handleDependencyFlag = true;
          });
        })
  
        const response = await Saml2Ops.importSaml2Provider({
          entityId: provider6.entityId,
          importData: getSaml2ProviderImportData(provider6.entityId),
          options: { deps: true },
          state,
        });
        expect(response).toBeTruthy();
        expect(handleDependencyFlag).toBe(true);
      });

      test(`3: Import hosted provider w/o dependencies '${provider6.entityId}'`, async () => {
        expect.assertions(2);
        let handleDependencyFlag = false;
        // console.debug('sandlog: before intercept');
        ctx.polly.server.host(c[`${testHost}`].host, () => {
          ctx.polly.server.put('/am/json/*/scripts/:id').once('request', req => {
            // console.debug('sandlog: inside intercept');
            handleDependencyFlag = true;
          });
        })
  
        const response = await Saml2Ops.importSaml2Provider({
          entityId: provider6.entityId,
          importData: getSaml2ProviderImportData(provider6.entityId),
          options: { deps: false },
          state,
        });
        expect(response).toBeTruthy();
        expect(handleDependencyFlag).toBe(false);
      });

      test(`4: Import remote provider '${provider7.entityId}' with metadata`, async () => {
        expect.assertions(1);
        const response = await Saml2Ops.importSaml2Provider({
          entityId: provider7.entityId,
          importData: getSaml2ProviderImportData(provider7.entityId),
          options: {
            deps: true
          },
          state,
        });
        expect(response).toBeTruthy();
        expect(response).toMatchSnapshot();
      });
    });
  }

  // Phase 2
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '2')
  ) {
    describe('importSaml2Providers()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.importSaml2Providers).toBeDefined();
      });

      test('1: Import providers', async () => {
        expect.assertions(2);
        const response = await Saml2Ops.importSaml2Providers({
          importData: getSaml2ProvidersImportData(),
          options: {
            deps: true
          },
          state,
        });
        expect(response.length).toBe(10);
        expect(response).toMatchSnapshot();
      });

      test('2: Import providers no deps', async () => {
        expect.assertions(2);
        const response = await Saml2Ops.importSaml2Providers({
          importData: getSaml2ProvidersImportData(),
          options: {
            deps: false
          },
          state,
        });
        expect(response.length).toBe(10);
        expect(response).toMatchSnapshot();
      });
    });
  }

  // Phase 3
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '3')
  ) {
    describe('deleteSaml2Provider()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.deleteSaml2Provider).toBeDefined();
      });

      test(`1: Delete hosted provider '${provider3.entityId}'`, async () => {
        const response = await Saml2Ops.deleteSaml2Provider({
          entityId: provider3.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test(`2: Delete remote provider '${provider4.entityId}'`, async () => {
        const response = await Saml2Ops.deleteSaml2Provider({
          entityId: provider4.entityId,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });
  }

  // Phase 4
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '4')
  ) {
    describe('deleteSaml2Providers()', () => {
      test('0: Method is implemented', async () => {
        expect(Saml2Ops.deleteSaml2Providers).toBeDefined();
      });

      test(`1: Delete all providers`, async () => {
        const response = await Saml2Ops.deleteSaml2Providers({ state });
        expect(response).toMatchSnapshot();
      });
    });
  }
});
