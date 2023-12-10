/*
 * We need to disable SSR globally because it will cause problems with
 * rosbridge and the websocket connection. We don't care about SEO for
 * this app anyway.
 */
export const ssr = false;
