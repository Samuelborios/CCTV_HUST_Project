import { defineDb, defineTable, column } from 'astro:db';

const Users = defineTable({
  columns: {
    username: column.text(),
    password: column.text(),
  }
})

export default defineDb({
  tables: {Users}
});
