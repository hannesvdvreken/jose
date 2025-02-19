import test from 'ava';

let root;
let keyRoot;

if ('WEBCRYPTO' in process.env) {
  root = keyRoot = '#dist/webcrypto';
} else if ('CRYPTOKEY' in process.env) {
  root = '#dist';
  keyRoot = '#dist/webcrypto';
} else {
  root = keyRoot = '#dist';
}

Promise.all([
  import(`${keyRoot}/util/generate_key_pair`),
  import(`${keyRoot}/util/generate_secret`),
]).then(
  ([{ default: generateKeyPair }, { default: generateSecret }]) => {
    let checkModulusLength;
    let getNamedCurve;
    async function testKeyPair(t, alg, options) {
      return t.notThrowsAsync(async () => {
        const { privateKey, publicKey } = await generateKeyPair(alg, options);
        t.true('type' in privateKey);
        t.is(privateKey.type, 'private');
        t.true('type' in publicKey);
        t.is(publicKey.type, 'public');

        for (const key of [publicKey, privateKey]) {
          // CryptoKey
          if ('algorithm' in key) {
            // Test curves are set properly
            if (key.algorithm.name === 'ECDH') {
              t.is(key.algorithm.namedCurve, (options && options.crv) || 'P-256');
            }

            switch (alg) {
              case 'ES256':
                t.is(key.algorithm.namedCurve, 'P-256');
                break;
              case 'ES384':
                t.is(key.algorithm.namedCurve, 'P-384');
                break;
              case 'ES512':
                t.is(key.algorithm.namedCurve, 'P-521');
                break;
            }

            // Test RSA modulusLength is used
            if (key.algorithm.modulusLength !== undefined) {
              t.is(key.algorithm.modulusLength, (options && options.modulusLength) || 2048);
            }
          } else {
            // KeyObject
            // Test OKP sub types are set properly
            if (key.asymmetricKeyType !== 'ec' && key.asymmetricKeyType !== 'rsa') {
              t.is(key.asymmetricKeyType, (options && options.crv.toLowerCase()) || 'ed25519');
            }

            // Test curves are set properly
            if (key.asymmetricKeyType === 'ec') {
              if (!getNamedCurve) {
                getNamedCurve = await import(`${root}/runtime/get_named_curve`);
              }
              getNamedCurve.weakMap.delete(key);
              getNamedCurve.default(key);
              switch (alg) {
                case 'ES256':
                  t.is(getNamedCurve.weakMap.get(key), 'P-256');
                  break;
                case 'ES256K':
                  t.is(getNamedCurve.weakMap.get(key), 'secp256k1');
                  break;
                case 'ES384':
                  t.is(getNamedCurve.weakMap.get(key), 'P-384');
                  break;
                case 'ES512':
                  t.is(getNamedCurve.weakMap.get(key), 'P-521');
                  break;
                default:
                  // ECDH-ES
                  t.is(getNamedCurve.weakMap.get(key), (options && options.crv) || 'P-256');
              }
            }

            // Test RSA modulusLength is used
            if (key.asymmetricKeyType === 'rsa') {
              if (!checkModulusLength) {
                checkModulusLength = await import(`${root}/runtime/check_modulus_length`);
              }
              checkModulusLength.weakMap.delete(key);
              checkModulusLength.default(key);
              t.is(checkModulusLength.weakMap.get(key), (options && options.modulusLength) || 2048);
            }
          }
        }
      });
    }
    testKeyPair.title = (title, alg) => `generate ${alg} key pair${title ? ` ${title}` : ''}`;

    test(testKeyPair, 'PS256');
    test('with modulusLength', testKeyPair, 'PS256', { modulusLength: 3072 });
    test(testKeyPair, 'PS384');
    test('with modulusLength', testKeyPair, 'PS384', { modulusLength: 3072 });
    test(testKeyPair, 'PS512');
    test('with modulusLength', testKeyPair, 'PS512', { modulusLength: 3072 });
    test(testKeyPair, 'RS256');
    test('with modulusLength', testKeyPair, 'RS256', { modulusLength: 3072 });
    test(testKeyPair, 'RS384');
    test('with modulusLength', testKeyPair, 'RS384', { modulusLength: 3072 });
    test(testKeyPair, 'RS512');
    test('with modulusLength', testKeyPair, 'RS512', { modulusLength: 3072 });
    test(testKeyPair, 'RSA-OAEP');
    test('with modulusLength', testKeyPair, 'RSA-OAEP', { modulusLength: 3072 });
    test(testKeyPair, 'RSA-OAEP-256');
    test('with modulusLength', testKeyPair, 'RSA-OAEP-256', { modulusLength: 3072 });
    test(testKeyPair, 'RSA-OAEP-384');
    test('with modulusLength', testKeyPair, 'RSA-OAEP-384', { modulusLength: 3072 });
    test(testKeyPair, 'RSA-OAEP-512');
    test('with modulusLength', testKeyPair, 'RSA-OAEP-512', { modulusLength: 3072 });
    test(testKeyPair, 'ES256');
    test(testKeyPair, 'ES384');
    test(testKeyPair, 'ES512');
    test(testKeyPair, 'ECDH-ES');
    test(testKeyPair, 'ECDH-ES+A128KW');
    test(testKeyPair, 'ECDH-ES+A192KW');
    test(testKeyPair, 'ECDH-ES+A256KW');

    for (const crv of ['P-256', 'P-384', 'P-521']) {
      test(`crv: ${crv}`, testKeyPair, 'ECDH-ES', { crv });
      test(`crv: ${crv}`, testKeyPair, 'ECDH-ES+A128KW', { crv });
      test(`crv: ${crv}`, testKeyPair, 'ECDH-ES+A192KW', { crv });
      test(`crv: ${crv}`, testKeyPair, 'ECDH-ES+A256KW', { crv });
    }

    function conditional({ webcrypto = 1, electron = 1 } = {}, ...args) {
      let run = test;
      if ((!webcrypto && 'WEBCRYPTO' in process.env) || 'CRYPTOKEY' in process.env) {
        run = run.failing;
      }

      if (!electron && 'electron' in process.versions) {
        run = run.failing;
      }
      return run;
    }

    conditional({ webcrypto: 0 })(testKeyPair, 'EdDSA');
    conditional({ webcrypto: 0 })('crv: Ed25519', testKeyPair, 'EdDSA', { crv: 'Ed25519' });
    conditional({ webcrypto: 0, electron: 0 })('crv: Ed448', testKeyPair, 'EdDSA', {
      crv: 'Ed448',
    });
    conditional({ webcrypto: 0, electron: 0 })(testKeyPair, 'ES256K');
    conditional({ webcrypto: 0 })(testKeyPair, 'RSA1_5');
    conditional({ webcrypto: 0 })('with modulusLength', testKeyPair, 'RSA1_5', {
      modulusLength: 3072,
    });
    for (const crv of ['X25519', 'X448']) {
      conditional({ webcrypto: 0, electron: crv === 'X25519' })(
        `crv: ${crv}`,
        testKeyPair,
        'ECDH-ES',
        { crv },
      );
      conditional({ webcrypto: 0, electron: crv === 'X25519' })(
        `crv: ${crv}`,
        testKeyPair,
        'ECDH-ES+A128KW',
        { crv },
      );
      conditional({ webcrypto: 0, electron: crv === 'X25519' })(
        `crv: ${crv}`,
        testKeyPair,
        'ECDH-ES+A192KW',
        { crv },
      );
      conditional({ webcrypto: 0, electron: crv === 'X25519' })(
        `crv: ${crv}`,
        testKeyPair,
        'ECDH-ES+A256KW',
        { crv },
      );
    }

    async function testSecret(t, alg, expectedLength) {
      return t.notThrowsAsync(async () => {
        const secret = await generateSecret(alg);

        if ('symmetricKeySize' in secret) {
          t.is(secret.symmetricKeySize, expectedLength >> 3);
          t.true('type' in secret);
          t.is(secret.type, 'secret');
        } else if ('algorithm' in secret) {
          t.is(secret.algorithm.length, expectedLength);
          t.true('type' in secret);
          t.is(secret.type, 'secret');
        } else if (secret instanceof Uint8Array) {
          t.is(secret.length, expectedLength >> 3);
        } else {
          t.fail('unexpected type returned');
        }
      });
    }
    testSecret.title = (title, alg) => `generate ${alg} secret${title ? ` ${title}` : ''}`;

    test(testSecret, 'HS256', 256);
    test(testSecret, 'HS384', 384);
    test(testSecret, 'HS512', 512);
    test(testSecret, 'A128CBC-HS256', 256);
    test(testSecret, 'A192CBC-HS384', 384);
    test(testSecret, 'A256CBC-HS512', 512);
    test(testSecret, 'A128KW', 128);
    test(testSecret, 'A192KW', 192);
    test(testSecret, 'A256KW', 256);
    test(testSecret, 'A128GCMKW', 128);
    test(testSecret, 'A192GCMKW', 192);
    test(testSecret, 'A256GCMKW', 256);
    test(testSecret, 'A128GCM', 128);
    test(testSecret, 'A192GCM', 192);
    test(testSecret, 'A256GCM', 256);
  },
  (err) => {
    test('failed to import', (t) => {
      console.error(err);
      t.fail();
    });
  },
);
