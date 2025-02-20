// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/*
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params })
      return { data: result.data }
    } catch (axiosError) {
      let err = axiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }*/

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_ADMIN_SERVER }),
  // The "endpoints" represent operations and requests for this server
  endpoints: builder => ({
    // The `getPosts` endpoint is a "query" operation that returns data
    getTalkgroups: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: (shortName) => ({ url: `/talkgroups/${shortName}`, credentials: "include" })
    }),
    getGroups: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: (shortName) => ({ url: `/groups/${shortName}`, credentials: "include" }),
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Group', _id })), 'Group']
          : ['Group'],
    }),

    getErrors: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: (shortName) => ({ url: `${process.env.REACT_APP_BACKEND_SERVER}/${shortName}/errors` })
    }),
    updateGroup: builder.mutation({
      query: (group) => ({
        url: `/groups/${group.shortName}/${group._id}`,
        method: 'POST',
        credentials: "include",
        body: group,
      }),
      async onQueryStarted(group, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedGroup } = await queryFulfilled
          dispatch(
            apiSlice.util.updateQueryData('getGroups', updatedGroup.shortName, (groups) => {
              const groupIndex = groups.findIndex((obj => obj.groupId === updatedGroup.groupId));
              groups[groupIndex] = updatedGroup;
            })
          )
        } catch { }
      },
    }),
    createGroup: builder.mutation({
      query: (group) => ({
        url: `/groups/${group.shortName}`,
        method: 'POST',
        credentials: "include",
        body: group,
      }),
      async onQueryStarted(group, { dispatch, queryFulfilled }) {
        try {
          const { data: newGroup } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData('getGroups', newGroup.shortName, (groups) => {
              groups.push(newGroup);
            })
          )
        } catch { }
      },
    }),
    deleteGroup: builder.mutation({
      query: (group) => ({
        url: `/groups/${group.shortName}/${group._id}`,
        method: 'DELETE',
        credentials: "include"
      }),

      async onQueryStarted(group, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            apiSlice.util.updateQueryData('getGroups', group.shortName, (groups) => {
              const groupIndex = groups.findIndex((obj => obj.groupId === group.groupId));
              groups.splice(groupIndex,1);
            })
          )
        } catch { }
      },
    }),
    saveGroupOrder: builder.mutation({
      query: ({shortName, order}) => ({
        url: `/groups/${shortName}/reorder`,
        method: 'POST',
        credentials: "include",
        body: order,
      }),

      //invalidatesTags: (result, error, group) => ['Group'],
    }),
    importTalkgroups: builder.mutation({
      query: ({shortName,file}) => ({
        url: `${process.env.REACT_APP_ADMIN_SERVER}/talkgroups/${shortName}/import`,
        method: 'POST',
        credentials: "include",
        body: file,
      }),
      
      async onQueryStarted({shortName,file}, { dispatch, queryFulfilled }) {
        try {
          const { data: newTalkgroups } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData('getTalkgroups', shortName, (talkgroups) => {
              talkgroups.length = 0; // Clear your array
              talkgroups.push(...newTalkgroups);
            })
          )
        } catch { }
      },
      //invalidatesTags: (result, error, group) => ['Group'],
    }),
    getSystems: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: () => ({ url: `/systems`, credentials: "include" })
    }),
    getAllSystems: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: () => ({ url: `/admin/users`, credentials: "include" })
    }),
    getActiveUsers: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: () => ({ url: `/admin/users/active`, credentials: "include" })
    }),
    createSystem: builder.mutation({
      query: (system) => ({
        url: `/systems`,
        method: 'POST',
        credentials: "include",
        body: system,
      }),
      async onQueryStarted(system, { dispatch, queryFulfilled }) {
        try {
          const { data: newSystem } = await queryFulfilled
          dispatch(
            apiSlice.util.updateQueryData('getSystems', undefined, (systemsData) => {
              const systems = systemsData.systems;
              systems.push(newSystem);
            })
          )
        } catch {}
      },
    }),
    updateSystem: builder.mutation({
      query: (system) => ({
        url: `/systems/${system.shortName}`,
        method: 'POST',
        credentials: "include",
        body: system,
      }),
      async onQueryStarted(system, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedSystem } = await queryFulfilled
          dispatch(
            apiSlice.util.updateQueryData('getSystems', undefined, (systemsData) => {
              const systems = systemsData.systems;
              const systemIndex = systems.findIndex((obj => obj.shortName === updatedSystem.shortName));
              systems[systemIndex] = updatedSystem;
            })
          )
        } catch {}
      },
    }),
    deleteSystem: builder.mutation({
      query: (shortName) => ({
        url: `/systems/${shortName}`,
        method: 'DELETE',
        credentials: "include"
      }),
      async onQueryStarted(shortName, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            apiSlice.util.updateQueryData('getSystems', undefined, (systemsData) => {
              const systems = systemsData.systems;
              const systemIndex = systems.findIndex((obj => obj.shortName === shortName));
              systems.splice(systemIndex, 1);
            })
          )
        } catch {}
      },
    }),
  })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetGroupsQuery, useGetSystemsQuery, useGetAllSystemsQuery, useGetActiveUsersQuery, useGetTalkgroupsQuery, useGetErrorsQuery, useDeleteGroupMutation, useCreateGroupMutation, useCreateSystemMutation, useUpdateSystemMutation, useDeleteSystemMutation, useSaveGroupOrderMutation, useUpdateGroupMutation, useImportTalkgroupsMutation } = apiSlice
