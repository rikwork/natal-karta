class Users::Create
  def self.call(params)
    new(params).call
  end

  def initialize(params)
    @params = params
  end

  def call
    user = User.new(@params)

    if user.save
      { success: true, data: user }
    else
      { success: false, errors: user.errors }
    end
  end
end
