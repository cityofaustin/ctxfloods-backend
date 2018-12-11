-- rename our custom sql functions so that there aren't naming conflicts with default graphql-generated mutations.
comment on function floods.delete_community(integer) IS E'@name deleteCommunityFunction\nDeletes a community.';
comment on function floods.delete_status(integer) IS E'@name deleteStatusFunction\nDeletes a status.';
comment on function floods.delete_status_reason(integer) IS E'@name deleteStatusReasonFunction\nDeletes a status reason.';
