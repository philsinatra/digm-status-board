# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Events Scroll Animation

If the scrolling feels janky, remove the scroll snapping for the return to item[0]:

```ts
function scroll_to_next_event() {
  if (!event_data?.posts?.length || !events_container) return;

  current_index = current_index >= event_data.posts.length - 1 ? 0 : current_index + 1;
  const event_element = events_container.children[current_index] as HTMLElement;
  if (!event_element) return;

  const scroll_position = current_index === 0 ? 0 : event_element.offsetLeft;
  events_container.scrollTo({ left: scroll_position, behavior: 'smooth' });
}
```
