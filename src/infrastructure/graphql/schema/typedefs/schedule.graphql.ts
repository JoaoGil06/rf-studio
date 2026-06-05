export const scheduleTypeDefs = `#graphql
    type Query {
       schedule(id: ID!): Schedule!
       schedules(filter: SchedulesFilter, first: Int, after: String): ScheduleConnection!
       schedulesInRange(filter: SchedulesRangeFilter!): [Schedule!]!
    }

    type Mutation {
        registerSchedule(input: RegisterScheduleInput!): RegisterSchedulePayload!
        updateSchedule(input: UpdateScheduleInput!): UpdateSchedulePayload!
        deleteSchedule(input: DeleteScheduleInput!): DeleteSchedulePayload!
    }

    enum ScheduleStatus {
        pending
        confirmed
        completed
        cancelled
    }

    type Schedule {
        id: ID!
        userId: ID!
        serviceId: ID!
        status: ScheduleStatus!
        date: String!
        photoUrl: String
        createdAt: String!
        user: User!
        service: Service!
    }

    type ScheduleEdge {
        node: Schedule!
        cursor: String!
    }

    type ScheduleConnection {
        edges: [ScheduleEdge!]!
        pageInfo: PageInfo!
    }

    input SchedulesFilter {
        userId: ID
    }

    input SchedulesRangeFilter {
        user: ID
        year: Int
        month: Int
        weekStart: String
    }

    input RegisterScheduleInput {
        userId: ID!
        serviceId: ID!
        date: String!
        status: ScheduleStatus
        photoUrl: Upload
    }

     input UpdateScheduleInput {
        id: ID!
        status: ScheduleStatus
        date: String
        serviceId: ID
        photo: Upload
    }

    type UpdateScheduleSuccess {
        schedule: Schedule!
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

    union UpdateSchedulePayload =
        UpdateScheduleSuccess
        | ScheduleNotFoundError
        | ServiceNotFoundError
        | ScheduleAlreadyBookedError

    input DeleteScheduleInput {
        id: ID!
    }

    type DeleteScheduleSuccess {
        id: ID!
    }

    union DeleteSchedulePayload = DeleteScheduleSuccess | ScheduleNotFoundError
`;
