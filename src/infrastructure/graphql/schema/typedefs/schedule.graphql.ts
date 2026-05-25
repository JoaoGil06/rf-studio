export const scheduleTypeDefs = `#graphql
    type Query {
        _scheduleRoot: String
    }

    type Mutation {
        registerSchedule(input: RegisterScheduleInput!): RegisterSchedulePayload!
    }

    enum ScheduleStatus {
        pending
        confirmed
        completed
        cancelled
        no_show
    }

    type Schedule {
        id: ID!
        userId: ID!
        serviceId: ID!
        status: ScheduleStatus!
        date: String!
        photoUrl: String
        createdAt: String!
    }

    input RegisterScheduleInput {
        userId: ID!
        serviceId: ID!
        date: String!
        status: ScheduleStatus
        photoUrl: String
    }

    type ScheduleAlreadyBookedError {
        message: String!
    }

    type RegisterScheduleSuccess {
        schedule: Schedule!
    }

    union RegisterSchedulePayload =
          RegisterScheduleSuccess
        | UserNotFoundError
        | ServiceNotFoundError
        | ScheduleAlreadyBookedError
`;
