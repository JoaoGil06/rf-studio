export const scheduleTypeDefs = `#graphql
    type Query {
       schedule(id: ID!): Schedule!
       schedules(filter: SchedulesFilter, first: Int, after: String): ScheduleConnection!
       schedulesInRange(filter: SchedulesRangeFilter!): [Schedule!]!
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
