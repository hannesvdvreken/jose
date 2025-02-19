# Interface: FlattenedJWS

[types](../modules/types.md).FlattenedJWS

Flattened JWS definition. Payload is an optional return property, it
is not returned when JWS Unencoded Payload Option
[RFC7797](https://tools.ietf.org/html/rfc7797) is used.

## Hierarchy

* *Partial*<[*FlattenedJWSInput*](types.flattenedjwsinput.md)\>

  ↳ **FlattenedJWS**

## Table of contents

### Properties

- [header](types.flattenedjws.md#header)
- [payload](types.flattenedjws.md#payload)
- [protected](types.flattenedjws.md#protected)
- [signature](types.flattenedjws.md#signature)

## Properties

### header

• `Optional` **header**: [*JWSHeaderParameters*](types.jwsheaderparameters.md)

The "header" member MUST be present and contain the value JWS
Unprotected Header when the JWS Unprotected Header value is non-
empty; otherwise, it MUST be absent.  This value is represented as
an unencoded JSON object, rather than as a string.  These Header
Parameter values are not integrity protected.

Inherited from: Partial.header

Defined in: [types.d.ts:163](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L163)

___

### payload

• `Optional` **payload**: *string*

Overrides: Partial.payload

Defined in: [types.d.ts:213](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L213)

___

### protected

• `Optional` **protected**: *string*

The "protected" member MUST be present and contain the value
BASE64URL(UTF8(JWS Protected Header)) when the JWS Protected
Header value is non-empty; otherwise, it MUST be absent.  These
Header Parameter values are integrity protected.

Inherited from: Partial.protected

Defined in: [types.d.ts:178](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L178)

___

### signature

• **signature**: *string*

Overrides: Partial.signature

Defined in: [types.d.ts:214](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L214)
