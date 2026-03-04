class UserSerializer
  def initialize(user)
    @user = user
  end

  def as_json
    {
      id: @user.id,
      name: @user.name,
      email: @user.email,
      subscription_type: @user.subscription_type,
      subscription_expires_at: @user.subscription_expires_at,
      created_at: @user.created_at,
      updated_at: @user.updated_at
    }
  end
end
