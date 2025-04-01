import { db, Users } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Users).values([
		{ username: "admin", password: "admin" },
		{ username: "test2", password: "12345678" },
	]);
	console.log("Users seeded successfully!");
}
