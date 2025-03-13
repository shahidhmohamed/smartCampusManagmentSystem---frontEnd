import { IFile, NewFile } from './file.model';

export const sampleWithRequiredData: IFile = {
  id: '4f164679-f77b-4214-90fb-95a6a5828dc5',
};

export const sampleWithPartialData: IFile = {
  id: '5e858cbe-2fb0-451b-bfbb-93b0c3c9cf89',
  folderId: 'for quaintly',
  type: 'zowie knottily',
  fileSize: 698,
  contents: 'pro aw once',
};

export const sampleWithFullData: IFile = {
  id: '310e3547-cb5e-407f-82ba-3f387e2aa029',
  folderId: 'where',
  name: 'atomize kindly front',
  type: 'fooey draft drat',
  fileSize: 5085,
  createdBy: 'when but knife',
  createdAt: 'upsell into via',
  modifiedAt: 'aftermath',
  contents: 'hunt cooperative',
};

export const sampleWithNewData: NewFile = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
