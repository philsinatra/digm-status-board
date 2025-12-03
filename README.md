# DIGM Status Board

App for displaying DIGM information such as class schedules, events, and more.

## Getting Started

1. Make sure you're using **Node.js v22 or later**.
2. Install [pnpm](https://pnpm.io/):

   ```bash
   npm install -g pnpm
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. You're ready to develop your app!

## Developing

To start the local development server with hot module reloading:

```bash
pnpm dev
```

## Building for Production

To create an optimized build:

```bash
pnpm build
```

To preview the production build locally:

```bash
pnpm preview
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Events Scroll Animation

If the scrolling feels janky, remove the scroll snapping for the return to item[0]:

```ts
function scroll_to_next_event() {
	if (!event_data?.posts?.length || !events_container) return

	current_index = current_index >= event_data.posts.length - 1 ? 0 : current_index + 1
	const event_element = events_container.children[current_index] as HTMLElement
	if (!event_element) return

	const scroll_position = current_index === 0 ? 0 : event_element.offsetLeft
	events_container.scrollTo({ left: scroll_position, behavior: 'smooth' })
}
```

## Schedule

1. Move the schedule XLSX document into the `input` directory: `input/schedule.xlsx`
1. Run the extraction script: `node scripts/xlsx_extract.ts`
1. Clean up the output JSON as needed. The script has priority rules for specific classroom numbers.
