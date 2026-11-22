# Third-party notices

## NAFNet

The local blur-repair service adapts the NAFNet architecture by Megvii Research under the MIT License: https://github.com/megvii-research/NAFNet. The optional GoPro width-64 pretrained model is distributed by the upstream project. Set it up with `npm run ai:setup`; model weights are kept locally and excluded from Git.

## image-resize-compress

This project uses [`image-resize-compress`](https://www.npmjs.com/package/image-resize-compress) version 4.1.0 to decode and normalize image input in the browser. The package is distributed under the MIT License. See the package metadata and license included in `node_modules/image-resize-compress` for the complete license text and attribution.

## liquid-glass-react

This project uses [`liquid-glass-react`](https://github.com/rdev/liquid-glass-react) version 1.1.1 for decorative Liquid Glass surfaces on the landing page. It is distributed under the MIT License. This is a community React recreation, not an Apple library. See the package metadata and license included in `node_modules/liquid-glass-react` for the complete license text and attribution.

## Scroll Gallery

The landing page adapts the [Scroll Gallery component](https://docs.21st.dev/%40soralabs/components/scroll-gallery) by Sora UI (`@soralabs`), licensed under MIT. Its full-screen pinning, strip-mask image transitions, and animated title changes are customized for TicketStandard's photo-preparation story.

## Other runtime dependencies

The project also uses Next.js, React, GSAP, Phosphor Icons, Manrope, and the dependencies listed in `package.json`. Their respective license texts are distributed with their packages in `node_modules`.
