import {
  EdgeAlreadyExistsError,
  EdgeNotFoundError,
  SelfLoopError,
  VertexAlreadyExistsError,
  VertexNotFoundError,
} from './errors'

describe('Graph error classes', () => {
  describe('VertexAlreadyExistsError', () => {
    it('is catchable via instanceof', () => {
      const err = new VertexAlreadyExistsError('v1')
      expect(err).toBeInstanceOf(VertexAlreadyExistsError)
      expect(err).toBeInstanceOf(Error)
    })

    it('includes the vertex id in the message', () => {
      const err = new VertexAlreadyExistsError('v1')
      expect(err.message).toContain('v1')
    })

    it('has correct name property', () => {
      const err = new VertexAlreadyExistsError('v1')
      expect(err.name).toBe('VertexAlreadyExistsError')
    })
  })

  describe('VertexNotFoundError', () => {
    it('is catchable via instanceof', () => {
      const err = new VertexNotFoundError(42)
      expect(err).toBeInstanceOf(VertexNotFoundError)
      expect(err).toBeInstanceOf(Error)
    })

    it('includes the vertex id in the message', () => {
      const err = new VertexNotFoundError(42)
      expect(err.message).toContain('42')
    })

    it('has correct name property', () => {
      const err = new VertexNotFoundError(42)
      expect(err.name).toBe('VertexNotFoundError')
    })
  })

  describe('EdgeAlreadyExistsError', () => {
    it('is catchable via instanceof', () => {
      const err = new EdgeAlreadyExistsError('a', 'b')
      expect(err).toBeInstanceOf(EdgeAlreadyExistsError)
      expect(err).toBeInstanceOf(Error)
    })

    it('includes both vertex ids in the message', () => {
      const err = new EdgeAlreadyExistsError('src', 'tgt')
      expect(err.message).toContain('src')
      expect(err.message).toContain('tgt')
    })

    it('has correct name property', () => {
      const err = new EdgeAlreadyExistsError('a', 'b')
      expect(err.name).toBe('EdgeAlreadyExistsError')
    })
  })

  describe('EdgeNotFoundError', () => {
    it('is catchable via instanceof', () => {
      const err = new EdgeNotFoundError('x', 'y')
      expect(err).toBeInstanceOf(EdgeNotFoundError)
      expect(err).toBeInstanceOf(Error)
    })

    it('includes both vertex ids in the message', () => {
      const err = new EdgeNotFoundError('src', 'tgt')
      expect(err.message).toContain('src')
      expect(err.message).toContain('tgt')
    })

    it('has correct name property', () => {
      const err = new EdgeNotFoundError('x', 'y')
      expect(err.name).toBe('EdgeNotFoundError')
    })
  })

  describe('SelfLoopError', () => {
    it('is catchable via instanceof', () => {
      const err = new SelfLoopError('v1')
      expect(err).toBeInstanceOf(SelfLoopError)
      expect(err).toBeInstanceOf(Error)
    })

    it('includes the vertex id in the message', () => {
      const err = new SelfLoopError('v1')
      expect(err.message).toContain('v1')
    })

    it('has correct name property', () => {
      const err = new SelfLoopError('v1')
      expect(err.name).toBe('SelfLoopError')
    })
  })
})
