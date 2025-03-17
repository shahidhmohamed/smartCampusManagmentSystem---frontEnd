import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IGroupChat } from '../group-chat.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../group-chat.test-samples';

import { GroupChatService } from './group-chat.service';

const requireRestSample: IGroupChat = {
  ...sampleWithRequiredData,
};

describe('GroupChat Service', () => {
  let service: GroupChatService;
  let httpMock: HttpTestingController;
  let expectedResult: IGroupChat | IGroupChat[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(GroupChatService);
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

    it('should create a GroupChat', () => {
      const groupChat = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(groupChat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a GroupChat', () => {
      const groupChat = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(groupChat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a GroupChat', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of GroupChat', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a GroupChat', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a GroupChat', () => {
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

    describe('addGroupChatToCollectionIfMissing', () => {
      it('should add a GroupChat to an empty array', () => {
        const groupChat: IGroupChat = sampleWithRequiredData;
        expectedResult = service.addGroupChatToCollectionIfMissing([], groupChat);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(groupChat);
      });

      it('should not add a GroupChat to an array that contains it', () => {
        const groupChat: IGroupChat = sampleWithRequiredData;
        const groupChatCollection: IGroupChat[] = [
          {
            ...groupChat,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addGroupChatToCollectionIfMissing(groupChatCollection, groupChat);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a GroupChat to an array that doesn't contain it", () => {
        const groupChat: IGroupChat = sampleWithRequiredData;
        const groupChatCollection: IGroupChat[] = [sampleWithPartialData];
        expectedResult = service.addGroupChatToCollectionIfMissing(groupChatCollection, groupChat);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(groupChat);
      });

      it('should add only unique GroupChat to an array', () => {
        const groupChatArray: IGroupChat[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const groupChatCollection: IGroupChat[] = [sampleWithRequiredData];
        expectedResult = service.addGroupChatToCollectionIfMissing(groupChatCollection, ...groupChatArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const groupChat: IGroupChat = sampleWithRequiredData;
        const groupChat2: IGroupChat = sampleWithPartialData;
        expectedResult = service.addGroupChatToCollectionIfMissing([], groupChat, groupChat2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(groupChat);
        expect(expectedResult).toContain(groupChat2);
      });

      it('should accept null and undefined values', () => {
        const groupChat: IGroupChat = sampleWithRequiredData;
        expectedResult = service.addGroupChatToCollectionIfMissing([], null, groupChat, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(groupChat);
      });

      it('should return initial array if no GroupChat is added', () => {
        const groupChatCollection: IGroupChat[] = [sampleWithRequiredData];
        expectedResult = service.addGroupChatToCollectionIfMissing(groupChatCollection, undefined, null);
        expect(expectedResult).toEqual(groupChatCollection);
      });
    });

    describe('compareGroupChat', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareGroupChat(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'd98dd870-5fd4-41aa-9c45-df0ecff4ffb9' };
        const entity2 = null;

        const compareResult1 = service.compareGroupChat(entity1, entity2);
        const compareResult2 = service.compareGroupChat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'd98dd870-5fd4-41aa-9c45-df0ecff4ffb9' };
        const entity2 = { id: '189f68d8-ec01-4d1c-b069-3341ed362611' };

        const compareResult1 = service.compareGroupChat(entity1, entity2);
        const compareResult2 = service.compareGroupChat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'd98dd870-5fd4-41aa-9c45-df0ecff4ffb9' };
        const entity2 = { id: 'd98dd870-5fd4-41aa-9c45-df0ecff4ffb9' };

        const compareResult1 = service.compareGroupChat(entity1, entity2);
        const compareResult2 = service.compareGroupChat(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
