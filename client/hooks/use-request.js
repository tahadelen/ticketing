import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            if (url === '/api/payments') {
                console.log('call1');
            }
            const response = await axios[method](url, 
                { ...body, ...props }
            );

            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch(err) {
            console.log(err);
            if (url === '/api/payments') {
                console.log('call1(err): ', err);
            }
            setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops...</h4>
                    <ul className="my-0">
                        {
                            err.response 
                            ?
                            err.response.data.errors.map((err) => {
                                return (<li key={err.message}>{err.message}</li>)
                            })
                            :
                            err
                        }
                    </ul>
                </div>
            );
        }
    }

    return {doRequest, errors};
}

export default useRequest;