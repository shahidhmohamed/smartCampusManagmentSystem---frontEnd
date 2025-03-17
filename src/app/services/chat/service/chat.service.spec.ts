import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IChat } from '../chat.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../chat.test-samples';

import { ChatService } from './chat.service';

const requireRestSample: IChat = {
  ...sampleWithRequiredData,
};

describe('Chat Service', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let expectedResult: IChat | IChat[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ChatService);
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

    it('should create a Chat', () => {
      const chat = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(chat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Chat', () => {
      const chat = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(chat).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Chat', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Chat', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Chat', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Chat', () => {
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

    describe('addChatToCollectionIfMissing', () => {
      it('should add a Chat to an empty array', () => {
        const chat: IChat = sampleWithRequiredData;
        expectedResult = service.addChatToCollectionIfMissing([], chat);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(chat);
      });

      it('should not add a Chat to an array that contains it', () => {
        const chat: IChat = sampleWithRequiredData;
        const chatCollection: IChat[] = [
          {
            ...chat,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addChatToCollectionIfMissing(chatCollection, chat);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Chat to an array that doesn't contain it", () => {
        const chat: IChat = sampleWithRequiredData;
        const chatCollection: IChat[] = [sampleWithPartialData];
        expectedResult = service.addChatToCollectionIfMissing(chatCollection, chat);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(chat);
      });

      it('should add only unique Chat to an array', () => {
        const chatArray: IChat[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const chatCollection: IChat[] = [sampleWithRequiredData];
        expectedResult = service.addChatToCollectionIfMissing(chatCollection, ...chatArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const chat: IChat = sampleWithRequiredData;
        const chat2: IChat = sampleWithPartialData;
        expectedResult = service.addChatToCollectionIfMissing([], chat, chat2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(chat);
        expect(expectedResult).toContain(chat2);
      });

      it('should accept null and undefined values', () => {
        const chat: IChat = sampleWithRequiredData;
        expectedResult = service.addChatToCollectionIfMissing([], null, chat, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(chat);
      });

      it('should return initial array if no Chat is added', () => {
        const chatCollection: IChat[] = [sampleWithRequiredData];
        expectedResult = service.addChatToCollectionIfMissing(chatCollection, undefined, null);
        expect(expectedResult).toEqual(chatCollection);
      });
    });

    describe('compareChat', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareChat(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: '3c9c5d80-89f2-4da2-8c4d-58d6981a495d' };
        const entity2 = null;

        const compareResult1 = service.compareChat(entity1, entity2);
        const compareResult2 = service.compareChat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: '3c9c5d80-89f2-4da2-8c4d-58d6981a495d' };
        const entity2 = { id: '36275ad7-4868-4562-bcef-8fdd90ba5301' };

        const compareResult1 = service.compareChat(entity1, entity2);
        const compareResult2 = service.compareChat(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: '3c9c5d80-89f2-4da2-8c4d-58d6981a495d' };
        const entity2 = { id: '3c9c5d80-89f2-4da2-8c4d-58d6981a495d' };

        const compareResult1 = service.compareChat(entity1, entity2);
        const compareResult2 = service.compareChat(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
