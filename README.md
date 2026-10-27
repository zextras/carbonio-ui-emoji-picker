<!--
SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
SPDX-License-Identifier: AGPL-3.0-only
-->
<div align="center">
  <h1>Carbonio UI Emoji Picker</h1>
</div>

<div align="center">

The emoji picker shared by the Zextras Carbonio modules

[![Contributors][contributors-badge]][contributors]
[![Activity][activity-badge]][activity]
[![License][license-badge]](COPYING)
[![Project][project-badge]][project]
[![Twitter][twitter-badge]][twitter]

</div>

### Why a shared package

The picker is [emoji-mart](https://github.com/missive/emoji-mart), a web component registered as the `em-emoji-picker`
custom element when emoji-mart is loaded. A tag can be registered only once per page, and the shell loads every module
into the same page: when two modules bundle their own emoji-mart, the second one throws `Illegal constructor` as soon as
it opens a picker.

This package must therefore be loaded once per page. The shell provides it to the modules, like
`@zextras/carbonio-ui-preview`, so modules declare it as an external instead of bundling it.
As long as some modules still bundle their own emoji-mart, the picker uses the `em-emoji-picker` class already registered
on the page, if any.

emoji-mart and its data are loaded the first time a picker is mounted, in separate chunks, so they do not weigh on the
shell startup.

### Usage

Install the package

```shell
pnpm add @zextras/carbonio-ui-emoji-picker
```

Render the picker

```tsx
import { EmojiPicker, type Emoji } from '@zextras/carbonio-ui-emoji-picker';

// ...

<EmojiPicker
  onEmojiSelect={(emoji: Emoji): void => insertText(emoji.native)}
  locale="it"
  theme="dark"
  previewPosition="none"
  skinTonePosition="none"
  data-testid="emoji-picker"
/>
```

- The picker appears asynchronously, once emoji-mart is loaded: in tests, wait for the `em-emoji-picker` element.
- The props other than `onEmojiSelect`, `className`, `style`, `id` and `data-testid` are the
  [emoji-mart options](https://github.com/missive/emoji-mart#options--props). A change to any of them rebuilds the
  picker, while a new `onEmojiSelect` does not.
- The ref is forwarded to the `div` hosting the picker, so `styled(EmojiPicker)` and DOM listeners work as usual.
- Locales other than `en` are downloaded by emoji-mart from its CDN, unless their translations are passed as `i18n`.

### How to build

#### Setup

- clone this repo
- install the dependencies

```shell
pnpm install
```

#### Build

```shell
pnpm run build
```

#### Try it in a module

Build and install the package into a local module, e.g. Mails:

```shell
PKG_PATH=../carbonio-mails-ui pnpm run packTo
```

## License

Carbonio UI Emoji Picker - The emoji picker shared by the Zextras Carbonio modules

Copyright (C) 2026 Zextras <https://www.zextras.com>

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, version 3 only of the License.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see [Licenses - GNU Project - Free
Software Foundation](https://www.gnu.org/licenses/licenses.html
"https://www.gnu.org/licenses/licenses.html")

See [COPYING](COPYING) file for the project license details

See [THIRDPARTIES](THIRDPARTIES) file for other licenses details

### Copyright and Licensing notices

All non-software material (such as, for example, names, images, logos, sounds) is owned by Zextras s.r.l. and is licensed under [CC-BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Where not specified, all source files owned by Zextras s.r.l. are licensed under AGPL-3.0-only

[contributors-badge]: https://img.shields.io/github/contributors/zextras/carbonio-ui-emoji-picker "Contributors"
[contributors]: https://github.com/zextras/carbonio-ui-emoji-picker/graphs/contributors "Contributors"
[activity-badge]: https://img.shields.io/github/commit-activity/m/zextras/carbonio-ui-emoji-picker "Activity"
[activity]: https://github.com/zextras/carbonio-ui-emoji-picker/pulse "Activity"
[license-badge]: https://img.shields.io/badge/license-AGPL%203-green "License AGPL 3"
[project-badge]: https://img.shields.io/badge/project-carbonio-informational "Project Carbonio"
[project]: https://www.zextras.com/carbonio/ "Project Carbonio"
[twitter-badge]: https://img.shields.io/twitter/follow/zextras?style=social&logo=twitter "Follow on Twitter"
[twitter]: https://twitter.com/intent/follow?screen_name=zextras "Follow Zextras on Twitter"
