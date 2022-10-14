import { defineConfig } from "vite";
import todoParser from './plugin/todoParser';

export default defineConfig({
    plugins: [
        todoParser()
    ],
    assetsInclude: [
        "src/**/*.todo"
    ]
})