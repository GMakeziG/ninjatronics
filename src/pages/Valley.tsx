import { world } from "../lib/world.js";

export function Valley() {
  return (
    <main>
      <h1>Valley</h1>
      <ul>
        {world.districts.map((district) => (
          <li key={district.id}>
            {district.name} — {district.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
