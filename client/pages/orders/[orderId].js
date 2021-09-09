import { useEffect, useState } from "react";
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    console.log('order: ', order.id);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (payment) => {
            Router.push('/orders');
        }
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);
        return () => {
            clearInterval(timerId);
        }
    }, [order]);

    if (timeLeft < 0) {
        return (
            <div>
                Order Expired!
            </div>
        );
    }

    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout 
                token={({ id }) => { 
                    console.log('Token oluşuyor yani: ', id);
                    doRequest({ token: id });
                }}
                stripeKey="pk_test_51JX46xGXd1N0qW5LkuH2HGOBjrQSO1f9T61H511J1DSPwTXPTETSUzzAHJ9GYzHg6mQMFZNESboHVRMn4PlFX1rz00rKtWdeRv"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
}

export default OrderShow;