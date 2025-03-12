import { PostController } from "../controllers/PostController";

const postController = new PostController();

export const PostRoutes = [
    {
        method: "get",
        route: "/posts",            
        action: postController.getPublicPost,
        validation: [],
    },
    {
        method: "get",
        route: "/posts-authenticated",            
        action: postController.getAuthenticatedUserPost,
        validation: [],
        protected: true 
    },
    {
        method: "get",
        route: "/posts/:id",    
        action: postController.getPostById,
        validation: []
    },
    {
        method: "post",
        route: "/posts",             
        action: postController.createPost,
        validation: [],
        protected: true
    },
    {
        method: "put",
        route: "/posts/:id",          
        action: postController.updatePost,
        validation: [],
        protected: true
    },
    {
        method: "delete",
        route: "/posts/:id",          
        action: postController.deletePost,
        validation: [],
        protected: true
    },
    {
        method: "get",
        route: "/allposts",            
        action: postController.getEveryPost,
        validation: [],
    },
    {
        method: "get",
        route: "/posts-location",            
        action: postController.getPostsAtLocation,
        validation: [],
    }
]
