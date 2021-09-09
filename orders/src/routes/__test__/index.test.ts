import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@tdtickets/common';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('Fetches orders for an particular user', async () => {
    const ticket1 = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket1.save();

    const ticket2 = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'match',
        price: 20
    });
    await ticket2.save();

    const ticket3 = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'theater',
        price: 20
    });
    await ticket3.save();

    const user1 = global.signin();
    const user2 = global.signin();

    await request(app)
     .post('/api/orders')
     .set('Cookie', user1)
     .send({ ticketId: ticket1.id })
     .expect(201);

    const { body: order1 } = await request(app)
     .post('/api/orders')
     .set('Cookie', user2)
     .send({ ticketId: ticket2.id })
     .expect(201);

    const { body: order2 } = await request(app)
     .post('/api/orders')
     .set('Cookie', user2)
     .send({ ticketId: ticket3.id })
     .expect(201);

    const response = await request(app)
                            .get('/api/orders')
                            .set('Cookie', user2)
                            .expect(200);
    
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(order1.id);
    expect(response.body[1].id).toEqual(order2.id);
})