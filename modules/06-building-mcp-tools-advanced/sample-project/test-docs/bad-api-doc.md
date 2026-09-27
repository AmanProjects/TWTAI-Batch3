# Create User

This endpoint is used to create users. You send a POST request with a JSON body containing the user information you want to create, and the system will process the request and return information about the user that was created by the system, assuming the request was successful and no errors occurred during the processing of the user creation workflow.

**Fields:**
- email (required)
- name (required)
- role

The response will contain the user data. If something goes wrong, you will get an error.

Note: Make sure you have the right permissions before calling this.
