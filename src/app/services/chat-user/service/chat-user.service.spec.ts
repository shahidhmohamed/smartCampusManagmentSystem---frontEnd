import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IChatUser } from '../chat-user.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../chat-user.test-samples';

import { ChatUserService } from './chat-user.service';

const requireRestSample: IChatUser = {
  ...sampleWithRequiredData,
};

describe('ChatUser Service', () => {
  let service: ChatUserService;
  let httpMock: HttpTestingController;
  let expectedResult: IChatUser | IChatUser[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ChatUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a ChatUser', () => {
      const chatUser = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(chatUser).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ChatUser', () => {
      const chatUser = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(chatUser).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ChatUser', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ChatUser', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ChatUser', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a ChatUser', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addChatUserToCollectionIfMissing', () => {
      it('should add a ChatUser to an empty array', () => {
        const chatUser: IChatUser = sampleWithRequiredData;
        expectedResult = service.addChatUserToCollectionIfMissing([], chatUser);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(chatUser);
      });

      it('should not add a ChatUser to an array that contains it', () => {
        const chatUser: IChatUser = sampleWithRequiredData;
        const chatUserCollection: IChatUser[] = [
          {
            ...chatUser,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addChatUserToCollectionIfMissing(chatUserCollection, chatUser);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ChatUser to an array that doesn't contain it", () => {
        const chatUser: IChatUser = sampleWithRequiredData;
        const chatUserCollection: IChatUser[] = [sampleWithPartialData];
        expectedResult = service.addChatUserToCollectionIfMissing(chatUserCollection, chatUser);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(chatUser);
      });

      it('should add only unique ChatUser to an array', () => {
        const chatUserArray: IChatUser[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const chatUserCollection: IChatUser[] = [sampleWithRequiredData];
        expectedResult = service.addChatUserToCollectionIfMissing(chatUserCollection, ...chatUserArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const chatUser: IChatUser = sampleWithRequiredData;
        const chatUser2: IChatUser = sampleWithPartialData;
        expectedResult = service.addChatUserToCollectionIfMissing([], chatUser, chatUser2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(chatUser);
        expect(expectedResult).toContain(chatUser2);
      });

      it('should accept null and undefined values', () => {
        const chatUser: IChatUser = sampleWithRequiredData;
        expectedResult = service.addChatUserToCollectionIfMissing([], null, chatUser, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(chatUser);
      });

      it('should return initial array if no ChatUser is added', () => {
        const chatUserCollection: IChatUser[] = [sampleWithRequiredData];
        expectedResult = service.addChatUserToCollectionIfMissing(chatUserCollection, undefined, null);
        expect(expectedResult).toEqual(chatUserCollection);
      });
    });

    describe('compareChatUser', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareChatUser(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'a95f2d3a-a66c-4c4a-8202-4317d142ff46' };
        const entity2 = null;

        const compareResult1 = service.compareChatUser(entity1, entity2);
        const compareResult2 = service.compareChatUser(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'a95f2d3a-a66c-4c4a-8202-4317d142ff46' };
        const entity2 = { id: '0ee8f995-82cc-47ab-ab9e-3ffc1d6f32f7' };

        const compareResult1 = service.compareChatUser(entity1, entity2);
        const compareResult2 = service.compareChatUser(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'a95f2d3a-a66c-4c4a-8202-4317d142ff46' };
        const entity2 = { id: 'a95f2d3a-a66c-4c4a-8202-4317d142ff46' };

        const compareResult1 = service.compareChatUser(entity1, entity2);
        const compareResult2 = service.compareChatUser(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
