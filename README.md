
# zip-tz

[![npm package](https://img.shields.io/npm/v/zip-tz)](https://www.npmjs.com/package/zip-tz) [![typescript](https://img.shields.io/npm/types/zip-tz)](https://github.com/alecperkins/zip-tz) [![MIT license](https://img.shields.io/npm/l/zip-tz)](https://github.com/alecperkins/zip-tz/blob/main/LICENSE) [![test status](https://github.com/alecperkins/zip-tz/actions/workflows/test.yml/badge.svg)](https://github.com/alecperkins/zip-tz/actions/workflows/test.yml)

**Stop.** Before using this make sure you understand why it’s _wrong_ to determine time zone from ZIP code.

---

## zipTZ(string)

Given a ZIP code, get the most likely practical time zone in the [Time Zone Database](https://www.iana.org/time-zones) currently applicable to it. For the sake of bytes over-the-wire and lookup speed, this library does not enumerate all possible ZIP codes. Rather, it operates on ranges, and assumes the ZIP code is valid; non-existent ZIP codes may map to a time zone or `null`.

Rather than a more precise zone name, this library flattens the results to the largest canonical zone for that offset and DST behavior. The precise zones exist for historical reasons and are necessary in the Time Zone Database to compute past dates. For example, `America/Kentucky/Monticello` allows the database to describe the switch of several counties in Kentucky from Central to Eastern time in 2000. Since this library is only concerned with the current timezone configuration, it assigns those ZIP codes to the canonical zone for Eastern: `America/New_York`.

The set of supported time zones, including several outside of the US proper, since they also participate in the ZIP code system:

* `America/Adak`
* `America/Anchorage`
* `America/Chicago`
* `America/Denver`
* `America/Los_Angeles`
* `America/New_York`
* `America/Phoenix`
* `America/Puerto_Rico`
* `America/St_Thomas`
* `Pacific/Chuuk`
* `Pacific/Guam`
* `Pacific/Honolulu`
* `Pacific/Kosrae`
* `Pacific/Kwajalein`
* `Pacific/Majuro`
* `Pacific/Pago_Pago`
* `Pacific/Palau`
* `Pacific/Pohnpei`
* `Pacific/Saipan`
* `Pacific/Wake`


### Why not use this?

ZIP codes are inherently _not_ geographic areas, so while broadly useful it’s technically incorrect to geocode from a ZIP code alone. The county is generally the atom of time zones in the US, but there are exceptions. And even then, the routing of mail does not strictly follow the boundaries of states, counties, or even towns. As such, there are many examples where it’s impossible to assign a single time zone to a ZIP code, because there are multiple or zero that apply.

For example, 86502 has two time zones applicable because it partially serves areas within Navajo Nation (which does observe DST) in Arizona (which does not). For these scenarios, this library chooses the time zone that is subjectively "more correct", the one that is applicable to more of the area more of the time.

Usecases where the time zone is strictly important cannot be solved by only providing a ZIP code. And ultimately, time zones are a social convention, not a geographic quality. Ask your user what TZ they want to use!



## Installation & Usage

`npm install zip-tz`

and include as a JavaScript or TypeScript module (types included):

```typescript
import zipTZ from 'zip-tz';
```

…or a CommonJS module:

```javascript
const zipTZ = require('zip-tz');
```

Then call with a ZIP code:

```javascript
> zipTZ('10007')
'America/New_York'
```

Invalid ZIP codes will resolve, but malformed ZIP codes will throw:
```javascript
> zipTZ('83005') // Not real
'America/Denver'
> zipTZ('88888') // Real but not geographic
'America/Denver'
> zipTZ('1000') // Incomplete
Uncaught Error: Invalid ZIP code format: 1000
> zipTZ('H3B 3A7') // Canadian
Uncaught Error: Invalid ZIP code format: H3B 3A7
```



## Author

[Alec Perkins](https://alecperkins.net)


## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).

See `./LICENSE` for more information.
