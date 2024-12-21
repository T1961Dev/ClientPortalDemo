from flask import Flask, jsonify, request
from flask_cors import CORS
import supabaseInit as supabase
import uuid
import logging
from datetime import datetime

supabaseClient = supabase.supabase

app = Flask(__name__)

# Allow CORS for the frontend (localhost:5173)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.route("/loginAdmin", methods=["POST", "OPTIONS"])
def login_admin():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Simulate login using Supabase
        response = supabaseClient.auth.sign_in_with_password({
            "email": "tomasjonesdev@gmail.com",
            "password": "Hello!"  # Admin credentials
        })

        user = response.user
        session = response.session

        # Get the 'company' from user_metadata if it exists
        company = user.user_metadata.get('company', None)

        result = {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "company": company  # Company from user_metadata
            },
            "session": {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "expires_in": session.expires_in
            }
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/loginClient", methods=["POST", "OPTIONS"])
def login_client():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Simulate login using Supabase
        response = supabaseClient.auth.sign_in_with_password({
            "email": "tomastrombone@outlook.com",
            "password": "Hello!"  # Client credentials
        })

        user = response.user
        session = response.session

        # Get the 'company' from user_metadata if it exists
        company = user.user_metadata.get('company', None)

        result = {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "company": company  # Company from user_metadata
            },
            "session": {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "expires_in": session.expires_in
            }
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/getUser", methods=["GET"])
def get_user():
    try:
        # Extract the 'user_id' from the query parameters
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Validate the user_id format
        try:
            uuid.UUID(user_id)  # Try to convert user_id to a UUID object
        except ValueError:
            return jsonify({"error": "Invalid User ID format. Must be a valid UUID."}), 400

        # Query the 'users' table for the record with the given user_id
        response = supabaseClient.table("users").select("*").eq("authId", user_id).execute()

        if not response.data:
            return jsonify({"error": "User not found"}), 404

        # Return the first matching user record
        user_data = response.data[0]
        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/isAdmin", methods=["GET"])
def is_admin():
    try:
        auth_id = request.args.get('authId')

        if not auth_id:
            return jsonify({"error": "Auth ID is required"}), 400

        # Fetch the user's role based on authId
        response = supabaseClient.table("users").select("role").eq("authId", auth_id).execute()

        if not response.data:
            return jsonify({"error": "User not found"}), 404

        # Determine if the role is 'admin'
        role = response.data[0].get("role", "").lower()
        is_admin = role == "admin"

        # Return the isAdmin status
        return jsonify({"isAdmin": is_admin})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/getStaff", methods=["GET"])
def get_staff():
    try:
        user_id = request.args.get('user_id')
        company_name = request.args.get('company_name')

        if not user_id or not company_name:
            return jsonify({"error": "User ID and company name are required"}), 400

        # Validate if user_id is a valid UUID
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return jsonify({"error": "Invalid User ID format. Must be a valid UUID."}), 400

        # Fetch the user to check if they're an admin and get their company name
        user_response = supabaseClient.table("users").select("role", "company_name").eq("id", user_uuid).execute()

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_data = user_response.data[0]
        role = user_data["role"]
        user_company = user_data["company_name"]

        # Check if the logged-in user is an admin and if they have access to the company
        if role != 'admin' or company_name != user_company:
            return jsonify({"error": "You are not authorized to view this staff data"}), 403

        # Fetch staff for the selected company
        staff_response = supabaseClient.table("users").select("id", "name", "company").eq("company_name", company_name).execute()

        if not staff_response.data:
            return jsonify({"error": "No staff found for this company"}), 404

        return jsonify({"staff": staff_response.data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

logging.basicConfig(level=logging.DEBUG)  # Set to DEBUG for detailed logs

@app.route('/getClientsProjects', methods=['POST'])
def get_clients_projects():
    try:
        # Get the user authId from the request body
        data = request.json
        auth_id = data.get('authId')

        if not auth_id:
            return jsonify({"error": "authId is required"}), 400

        # Query Supabase to find the user by authId and get the associated project IDs
        user_response = supabaseClient.table('users').select('project').eq('authId', auth_id).execute()

        if not user_response.data:
            return jsonify({"error": "No user found with the given authId"}), 404

        # Extract the project IDs from the user response
        project_ids = [user['project'] for user in user_response.data]

        # Query the projects table using the project IDs to get the project details
        projects_response = supabaseClient.table('projects').select('*').in_('id', project_ids).execute()

        if not projects_response.data:
            return jsonify({"error": "No projects found for the user"}), 404

        return jsonify({"projects": projects_response.data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-user', methods=['PUT'])
def update_user():
    try:
        data = request.json
        user_id = data.get('id')
        name = data.get('name')
        email = data.get('email')
        role = data.get('role')
        company = data.get('company')

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        response = supabaseClient.table('users').update({
            "name": name,
            "email": email,
            "role": role,
            "company": company
        }).eq('id', user_id).execute()

        if response.error:
            return jsonify({"error": response.error.message}), 400

        return jsonify({"message": "User updated successfully", "user": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/createProject', methods=['POST'])
def create_project():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    company = data.get('company')

    # Log the received company_id for debugging
    print(f"Received company_id: {company}")  # This will log to your backend console

    # Ensure all fields are provided
    if not all([name, description, start_date, end_date, company]):
        return jsonify({'error': 'All fields are required'}), 400

    # Prepare the project data for insertion into Supabase
    project_data = {
        'name': name,
        'description': description,
        'start_date': start_date,
        'end_date': end_date,
        'company': company,  # Assuming 'company' is the field storing the company ID
    }

    # Insert the new project into the 'projects' table
    try:
        response = supabaseClient.table('projects').insert(project_data).execute()
        
        # Check if the insertion was successful
        if response.data:
            return jsonify(response.data[0]), 201  # Return the created project
        else:
            return jsonify({'error': 'Failed to create project', 'details': response.error}), 500
    except Exception as e:
        error_message = f"An error occurred during project creation: {str(e)}"
        print(error_message)  # Print the error to the console for debugging
        return jsonify({'error': error_message}), 500




@app.route('/addUser', methods=['POST'])
def add_user():
    data = request.get_json()

    # Extract data from the request body
    username = data.get('username')
    company = data.get('company')
    email = data.get('email')
    password = data.get('password')
    role = data.get("role")

    # Validate input
    if not all([username, company, email, password, role]):
        return jsonify({'error': 'All fields are required'}), 400

    # Query the users table to check if the email already exists
    existing_user = supabaseClient.table('users').select('email').eq('email', email).execute()

    if existing_user.data:
        # If a user with the same email already exists, return an error
        return jsonify({'error': 'Email already exists'}), 400

    # If email doesn't exist, proceed with adding the new user
    new_user = {
        'name': username,
        'company': company,
        'email': email,
        "role": role
        # No hashing, storing plain text password
    }
    response = supabaseClient.auth.sign_up({"email": email, "password": password})
    print(response)

    # Insert the new user into the 'users' table
    result = supabaseClient.table('users').insert(new_user).execute()

    if result.status_code == 201:
        return jsonify({'success': True, 'user': new_user}), 201
    else:
        return jsonify({'error': 'Failed to add user'}), 500


@app.route('/api/delete-user', methods=['DELETE'])
def delete_user():
    try:
        # Parse the request data
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required to delete user'}), 400

        # Delete user from the users table
        db_response = supabaseClient.table('users').delete().eq('email', email).execute()

        return jsonify({'success': True, 'message': 'User deleted successfully'}), 200

    except Exception as e:
        # Log any unexpected errors
        logging.error(f"Unexpected error in /api/delete-user: {str(e)}")
        return jsonify({'error': 'An internal error occurred', 'details': str(e)}), 500




@app.route("/getCompanies", methods=["GET"])
def getCompanies():
    try:
        # Query the 'companies' table to fetch company names
        response = supabaseClient.table("companies").select("name").execute()

        if not response.data:
            return jsonify({"error": "No companies found"}), 404

        # Extract the company names
        companies = [company['name'] for company in response.data]

        return jsonify({"companies": companies}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/getUsersByCompany", methods=["GET"])
def get_users_by_company():
    try:
        company_name = request.args.get('company_name')
        
        if not company_name:
            return jsonify({"error": "Company name is required"}), 400

        # Fetch users belonging to the selected company
        response = supabaseClient.table("users").select("*").eq("company", company_name).execute()
        print(response)

        if not response.data:
            return jsonify({"error": "No users found for this company"}), 404

        return jsonify({"users": response.data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/addUserToCompany", methods=["POST", "OPTIONS"])
def add_user_to_company():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        data = request.json
        if not data or not all(key in data for key in ("name", "email", "role", "company_name")):
            return jsonify({"error": "Missing required fields: name, email, role, company_name"}), 400

        # Validate if the role is valid
        if data['role'] not in ['admin', 'client', 'staff']:
            return jsonify({"error": "Invalid role. Choose from 'admin', 'client', 'staff'"}), 400

        # Check if the company exists in the database
        company_name = data["company_name"]
        company_check_response = supabaseClient.table("users").select("company").eq("company", company_name).execute()

        if not company_check_response.data:
            return jsonify({"error": f"Company '{company_name}' not found"}), 404

        # Insert the new user into the 'users' table with the company
        new_user = {
            "id": str(uuid.uuid4()),  # Generate a new UUID for the user
            "name": data["name"],
            "email": data["email"],
            "role": data["role"],
            "company": company_name,
            "company_name": company_name
        }

        insert_response = supabaseClient.table("users").insert(new_user).execute()

        if insert_response.status_code != 201:
            return jsonify({"error": "Failed to add user to company"}), 500

        return jsonify({"message": "User added successfully", "user": new_user}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/create_user", methods=["POST", "OPTIONS"])
def create_user():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        data = request.json
        if not data or not all(key in data for key in ("name", "authId", "companyId")):
            return jsonify({"error": "Missing required fields: name, authId, companyId"}), 400

        # Validate if company exists in the database
        company_name = data["companyId"]
        company_check_response = supabaseClient.table("users").select("company").eq("company", company_name).execute()

        if not company_check_response.data:
            return jsonify({"error": f"Company '{company_name}' not found"}), 404

        # Insert the new user into the 'users' table
        new_user = {
            "id": str(uuid.uuid4()),  # Generate a new UUID for the user
            "name": data["name"],
            "email": data["authId"],  # Assuming `authId` is the user's email
            "role": "staff",  # Default role, could be adjusted based on your requirements
            "company": company_name,
            "company_name": company_name
        }

        insert_response = supabaseClient.table("users").insert(new_user).execute()

        if insert_response.status_code != 201:
            return jsonify({"error": "Failed to add user to company"}), 500

        return jsonify({"message": "User added successfully", "user": new_user}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_companies", methods=["GET"])
def get_companies():
    try:
        # Query the 'users' table to fetch company names
        response = supabaseClient.table("users").select("company").execute()

        if not response.data:
            return jsonify({"error": "No companies found"}), 404

        # Remove duplicates by converting the list to a set and then back to a list
        companies = list({company['company'] for company in response.data})

        return jsonify({"companies": companies}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/getAllCompanies", methods=["GET"])
def get_all_companies():
    try:
        response = supabaseClient.table("companies").select("*").execute()
        if not response.data:
            return jsonify({"error": "No companies found"}), 404
        return jsonify({"companies": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/getAllProjects", methods=["GET"])
def get_all_projects():
    try:
        # Fetch all projects from Supabase
        response = supabaseClient.table("projects").select("*").execute()

        if response.data:
            return jsonify({"projects": response.data}), 200
        else:
            return jsonify({"error": "No projects found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/getUsersByProject', methods=['GET'])
def get_users_by_project():
    project_id = request.args.get('project_id')

    if not project_id:
        return jsonify({'error': 'Project ID is required'}), 400

    try:
        # Fetch users associated with the project
        response = supabaseClient.table('users') \
            .select('*') \
            .eq('project', project_id) \
            .execute()

        # Debug: Print the full response for debugging
        print("Response from Supabase (users):", response)

        # Extracting authId values directly
        user_ids = [entry['authId'] for entry in response.data if entry.get('authId')]

        # Debug: Print the collected user_ids
        print("Collected user_ids:", user_ids)

        if not user_ids:
            return jsonify({'error': 'No valid users found for this project'}), 404

        # Fetch user details using the user_ids
        user_response = supabaseClient.table('users') \
            .select('id, name, email') \
            .in_('authId', user_ids) \
            .execute()

        # Debug: Print the full user response for debugging
        print("Response from Supabase (user details):", user_response)

        return jsonify({'users': user_response.data})

    except Exception as e:
        # Log the exact error for debugging
        print("Error occurred:", str(e))
        return jsonify({'error': str(e)}), 500


@app.route("/addUsersToProject", methods=["POST", "OPTIONS"])
def add_users_to_project():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        data = request.json
        # Ensure required fields are provided
        if not data or not all(key in data for key in ("user_ids", "project_id")):
            return jsonify({"error": "Missing required fields: user_ids, project_id"}), 400

        user_ids = data["user_ids"]
        project_id = data["project_id"]

        # Check if the project exists in the database
        project_check_response = supabaseClient.table("projects").select("id").eq("id", project_id).execute()

        if not project_check_response.data:
            return jsonify({"error": f"Project with ID '{project_id}' not found"}), 404

        # Iterate over the user IDs and update the 'project' column for each user
        updated_users = []
        for user_id in user_ids:
            # Check if the user exists in the database
            user_check_response = supabaseClient.table("users").select("*").eq("id", user_id).execute()

            if not user_check_response.data:
                return jsonify({"error": f"User with ID '{user_id}' not found"}), 404

            selected_user = user_check_response.data[0]

            # Update the user's project column
            update_response = supabaseClient.table("users").update({"project": project_id}).eq("id", user_id).execute()

            if not update_response.data:
                return jsonify({"error": f"Failed to update user with ID '{user_id}'"}), 500

            # Add the updated user to the list
            updated_users.append({"id": selected_user["id"], "name": selected_user["name"], "email": selected_user["email"]})

        return jsonify(
            {
                "message": "Users successfully added to the project",
                "updated_users": updated_users,
                "project_id": project_id
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/removeUserFromProject", methods=["POST", "OPTIONS"])
def remove_user_from_project():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        data = request.json

        # Validate the request payload
        if not data or not data.get("user_id") or not data.get("project_id"):
            return jsonify({"error": "Missing required fields: user_id, project_id"}), 400

        user_id = data["user_id"]
        project_id = data["project_id"]

        # Check if the user exists in the database
        user_check_response = supabaseClient.table("users").select("id, project").eq("id", user_id).execute()
        if not user_check_response.data:
            return jsonify({"error": f"User with ID '{user_id}' not found"}), 404

        user = user_check_response.data[0]

        # Verify the user is currently associated with the specified project
        if user.get("project") != project_id:
            return jsonify({"error": f"User with ID '{user_id}' is not associated with project '{project_id}'"}), 400

        # Remove the user from the project
        supabaseClient.table("users").update({"project": None}).eq("id", user_id).execute()

        # Return a success response
        return jsonify({"message": f"User with ID '{user_id}' removed from project '{project_id}' successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


@app.route("/getCommentsByProject", methods=["GET"])
def get_comments_by_project():
    try:
        project_id = request.args.get('project_id')

        # Fetch comments for the given project ID
        comments_response = supabaseClient.table("comments").select("*").eq("projectId", project_id).execute()
        
        if not comments_response.data:
            return jsonify({"comments": []})

        # Fetch the user names for the userIds in the comments
        user_ids = [comment["userAuthId"] for comment in comments_response.data]
        users_response = supabaseClient.table("users").select("authId, name").in_("authId", user_ids).execute()
        
        # Create a dictionary for quick lookup of user names by userId
        user_dict = {user["authId"]: user["name"] for user in users_response.data}

        # Add the user names to the comments
        for comment in comments_response.data:
            comment["userName"] = user_dict.get(comment["userAuthId"], "Unknown")

        # Return comments with user names
        return jsonify({"comments": comments_response.data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500





@app.route("/addComment", methods=["POST"])
def add_comment():
    data = request.json
    project_id = data.get('project_id')
    comment = data.get('comment')
    sender = data.get('sender')  # User ID from the frontend

    # Validate required fields
    if not project_id or not comment or not sender:
        return jsonify({"error": "Project ID, comment, and sender are required"}), 400

    try:
        # Convert datetime to ISO 8601 string format
        created_at = datetime.utcnow().isoformat()

        # Fetch user name based on sender ID
        

        # Insert the new comment into the 'comments' table
        response = supabaseClient.table("comments").insert({
            "projectId": project_id,
            "content": comment,
            "created_at": created_at,
            "userAuthId": sender  # Authenticated user ID
        }).execute()

        # Check if the response has data (successful insertion)
        if response.data:
            return jsonify({
                "message": "Comment added successfully",
                "comment": {
                    "id": response.data[0]["id"],
                    "content": comment,
                    "created_at": created_at,
                    
                }
            }), 201
        else:
            return jsonify({"error": "Failed to add comment"}), 500

    except Exception as e:
        # Log the error for debugging and return a generic error message
        print(f"Error adding comment: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/getUserNameById', methods=['GET'])
def get_user_name_by_id():
    user_id = request.args.get('user_id')
    
    # Query Supabase to get the user's name using the user_id
    response = supabaseClient.table('users').select('name').eq('authId', user_id).execute()
    
    # Return the user name directly if found
    if response.data:
        user_name = response.data[0]['name']
        return jsonify({"name": user_name}), 200
    
    # If no user found, return a 404 without error handling
    return jsonify({"error": "User not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=8080)
