import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@tdtickets/common';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('Fetches the order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('Returns an error if one user tries to fetch another users order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    const otherUser = global.signin();
    
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', otherUser)
        .send()
        .expect(401);
});