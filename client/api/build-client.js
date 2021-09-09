import axios from "axios";

const buildClient = ({ req }) => {
    console.log('window: ', typeof window);
    if (typeof window === 'undefined') {
        // It is in server
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        // It is in browser
        return axios.create({
            baseURL: '/'
        });
    }
}

export default buildClient;