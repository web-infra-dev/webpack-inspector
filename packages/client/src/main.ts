// register vue composition api globally
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import routes from 'virtual:generated-pages';
import App from './App.vue';
import VueAwesomePaginate from 'vue-awesome-paginate';
import JsonViewer from 'vue3-json-viewer';
import '@unocss/reset/tailwind.css';
import 'vue-awesome-paginate/dist/style.css';
import './styles/main.css';
import './styles/cm.css';
import 'uno.css';

const app = createApp(App);
const router = createRouter({
  history: createWebHistory('/'),
  routes,
});
app.use(router);
app.use(VueAwesomePaginate);
app.use(JsonViewer);
app.mount('#app');
