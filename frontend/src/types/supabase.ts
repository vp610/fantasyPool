export interface Database {
    public: {
      Tables: {
        users: {
          Row: {
            id: string;
            auth_id: string;
            username: string;
            email: string;
            points: number;
            created_at: string;
          };
          Insert: {
            id?: string;
            auth_id: string;
            username: string;
            email: string;
            points?: number;
            created_at?: string;
          };
          Update: {
            id?: string;
            auth_id?: string;
            username?: string;
            email?: string;
            points?: number;
            created_at?: string;
          };
        };
        user_pools: {
          Row: {
            user_id: string;
            pool_id: number;
            created_at: string;
          };
          Insert: {
            user_id: string;
            pool_id: number;
            created_at?: string;
          };
          Update: {
            user_id?: string;
            pool_id?: number;
            created_at?: string;
          };
        };
      };
    };
  }