import { ResourceType } from "../enumerations/resource-type.model";


export interface IResource {
  id: string;
  resourceId?: string | null;
  name?: string | null;
  resourceType?: keyof typeof ResourceType | null;
  location?: string | null;
  capacity?: number | null;
  availability?: boolean | null;
}

export type NewResource = Omit<IResource, 'id'> & { id: null };
