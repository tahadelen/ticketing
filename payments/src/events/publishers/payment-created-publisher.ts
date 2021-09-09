import { Subjects, Publisher, PaymentCreatedEvent } from '@tdtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}