import { api } from 'src/boot/axios';

api.defaults.withCredentials = true;

export default api;
