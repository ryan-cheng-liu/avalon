import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import component_page_login from './page-login.vue';
import component_page_lobby from './page-lobby.vue';
import component_page_room from './page-room.vue';

export default new VueRouter({
    routes:[
        { path: '/login', name: 'login', component: component_page_login },
        { path: '/lobby', name: 'lobby', component: component_page_lobby },
        { path: '/room', name: 'room', component: component_page_room },
        { path: '/', redirect: '/login' },
    ]
});