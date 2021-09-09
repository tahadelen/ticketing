import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

it('return a 404 if the provided id does not exist', async () => {
    const id = mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Title',
            price: 20
        })
        .expect(404);
});

it('return a 401 if the user is not authenticated', async () => {
    const id = mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'Title',
            price: 20
        })
        .expect(401);
});

it('return a 401 if the user does not own the ticket', async () => {
    const cookie1 = global.signin();
    const response = await request(app)
        .put('/api/tickets')
        .set('Cookie', cookie1)
        .send({
            title: 'Title',
            price: 20
        });
        
    const cookie2 = global.signin();
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie2)
        .send({
            title: 'Title2',
            price: 24
        })
        .expect(401)
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .put('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Title',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Title2',
            price: -10
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 10
        })
        .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .put('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Title',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Title',
            price: 10
        })
        .expect(200);

    const ticketResponse = await request(app)
                                    .get(`/api/tickets/${response.body.id}`)
                                    .send();

    expect(ticketResponse.body.title).toEqual('Title');
    expect(ticketResponse.body.price).toEqual(10);
});

it('Rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .put('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Title',
            price: 20
        });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Title',
            price: 10
        })
        .expect(400);
});