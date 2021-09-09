import { Publisher, OrderCreatedEvent, Subjects } from "@tdtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
